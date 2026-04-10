package router

import (
	"context"
	"log/slog"
	"time"

	"github.com/faso-atlas/backend/internal/config"
	"github.com/faso-atlas/backend/internal/handlers"
	"github.com/faso-atlas/backend/internal/middleware"
	"github.com/faso-atlas/backend/internal/repository"
	"github.com/faso-atlas/backend/internal/services"
	"github.com/faso-atlas/backend/pkg/cache"
	pkgjwt "github.com/faso-atlas/backend/pkg/jwt"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

const systemCheckTimeout = 2 * time.Second

func New(db *gorm.DB, rdb *redis.Client, cfg *config.Config, logger *slog.Logger) *gin.Engine {
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()

	// Global middleware stack
	r.Use(middleware.CORS(cfg.AllowedOrigins)) // CORS first — ensures headers on all responses (incl. errors)
	r.Use(middleware.RequestID())
	r.Use(middleware.PrometheusMetrics())
	r.Use(middleware.Recovery())
	r.Use(middleware.Gzip())
	r.Use(gin.Logger())
	r.Use(middleware.ErrorHandler())

	// Redis cache layer
	apiCache := cache.New(rdb)

	jwtManager := pkgjwt.NewManager(cfg.JWTSecret)
	authMW := middleware.Auth(jwtManager)
	adminMW := middleware.RequireRole("admin")
	ownerMW := middleware.RequireRole("owner", "admin")

	// Rate limiter for auth endpoints (10 req / minute)
	authLimiter := middleware.RateLimiter(10, 1*time.Minute)

	// Redis-backed per-user rate limiter for API (300 req / minute)
	apiLimiter := middleware.RedisRateLimiter(rdb, 300, 1*time.Minute)

	// --- Repositories ---
	userRepo := repository.NewUserRepository(db)
	tokenRepo := repository.NewTokenRepository(db)
	placeRepo := repository.NewPlaceRepository(db)
	estabRepo := repository.NewEstablishmentRepository(db)
	resaRepo := repository.NewReservationRepository(db)
	itinRepo := repository.NewItineraryRepository(db)
	wikiRepo := repository.NewWikiRepository(db)
	atlasRepo := repository.NewAtlasRepository(db)
	symbolRepo := repository.NewSymbolRepository(db)
	reviewRepo := repository.NewReviewRepository(db)
	mapRepo := repository.NewMapRepository(db, rdb)
	favRepo := repository.NewFavoriteRepository(db)
	adRepo := repository.NewAdRepository(db)
	carRepo := repository.NewCarRentalRepository(db)
	regionRepo := repository.NewRegionRepository(db)
	notifRepo := repository.NewNotificationRepository(db)

	// --- Services ---
	emailSvc := services.NewEmailService(cfg.SendGridAPIKey, cfg.WebURL, logger)
	authSvc := services.NewAuthService(userRepo, tokenRepo, jwtManager, emailSvc, logger)
	mapSvc := services.NewMapService(mapRepo, logger)
	resaSvc := services.NewReservationService(resaRepo, estabRepo, logger)
	wikiSvc := services.NewWikiService(wikiRepo, logger)
	reviewSvc := services.NewReviewService(reviewRepo, placeRepo, logger)
	adminSvc := services.NewAdminService(userRepo, placeRepo, wikiRepo, estabRepo, itinRepo, resaRepo, logger)
	imageSvc := services.NewImageService(cfg.CloudinaryURL, logger)
	adSvc := services.NewAdService(adRepo, logger)
	paymentSvc := services.NewPaymentService(cfg.StripeSecretKey, cfg.StripeWebhookSecret, cfg.WebURL, resaRepo, logger)
	notifSvc := services.NewNotificationService(notifRepo, logger)

	// --- Handlers ---
	authH := handlers.NewAuthHandler(authSvc)
	mapH := handlers.NewMapHandler(mapSvc)
	destH := handlers.NewDestinationHandler(placeRepo)
	estabH := handlers.NewEstablishmentHandler(estabRepo)
	resaH := handlers.NewReservationHandler(resaSvc)
	paymentH := handlers.NewPaymentHandler(paymentSvc)
	itinH := handlers.NewItineraryHandler(itinRepo)
	atlasH := handlers.NewAtlasHandler(atlasRepo)
	wikiH := handlers.NewWikiHandler(wikiSvc)
	symbolH := handlers.NewSymbolHandler(symbolRepo)
	searchH := handlers.NewSearchHandler(placeRepo, estabRepo, wikiRepo, itinRepo)
	reviewH := handlers.NewReviewHandler(reviewSvc)
	adminH := handlers.NewAdminHandler(adminSvc, estabRepo, itinRepo, resaRepo, carRepo, symbolRepo, regionRepo)
	favH := handlers.NewFavoriteHandler(favRepo)
	imageH := handlers.NewImageHandler(imageSvc)
	adH := handlers.NewAdHandler(adSvc)
	carH := handlers.NewCarRentalHandler(carRepo)
	ownerH := handlers.NewOwnerHandler(estabRepo, placeRepo, resaRepo)
	notifH := handlers.NewNotificationHandler(notifSvc)
	nearbyH := handlers.NewNearbyHandler(placeRepo, estabRepo)

	v1 := r.Group("/api/v1", apiLimiter)

	// Auth (rate-limited)
	auth := v1.Group("/auth", authLimiter)
	{
		auth.POST("/register", authH.Register)
		auth.POST("/login", authH.Login)
		auth.POST("/refresh", authH.Refresh)
		auth.GET("/me", authMW, authH.Me)
		auth.PUT("/profile", authMW, authH.UpdateProfile)
		auth.PUT("/change-password", authMW, authH.ChangePassword)
		auth.POST("/verify-email", authH.VerifyEmail)
		auth.POST("/request-verification", authMW, authH.RequestVerification)
		auth.POST("/forgot-password", authH.ForgotPassword)
		auth.POST("/reset-password", authH.ResetPassword)
	}

	// Cache middleware shortcuts
	cacheMap := middleware.ResponseCache(apiCache, "map", cache.TTLMedium)
	cacheDest := middleware.ResponseCache(apiCache, "dest", cache.TTLMedium)
	cacheEstab := middleware.ResponseCache(apiCache, "estab", cache.TTLMedium)
	cacheAtlas := middleware.ResponseCache(apiCache, "atlas", cache.TTLStatic)
	cacheSymbols := middleware.ResponseCache(apiCache, "symbols", cache.TTLStatic)
	cacheWiki := middleware.ResponseCache(apiCache, "wiki", cache.TTLMedium)
	cacheSearch := middleware.ResponseCache(apiCache, "search", cache.TTLShort)
	cacheRegions := middleware.ResponseCache(apiCache, "regions", cache.TTLStatic)
	cacheStats := middleware.ResponseCache(apiCache, "stats", cache.TTLRealtime)

	// Map (cached)
	mapG := v1.Group("/map")
	{
		mapG.GET("/places", cacheMap, mapH.GetPlaces)
		mapG.GET("/places/:id", mapH.GetPlace)
		mapG.GET("/regions", cacheRegions, mapH.GetRegions)
	}

	// Destinations (cached)
	dest := v1.Group("/destinations")
	{
		dest.GET("", cacheDest, destH.List)
		dest.GET("/:slug", cacheDest, destH.Get)
	}

	cacheItin := middleware.ResponseCache(apiCache, "itin", cache.TTLMedium)

	// Itineraries (cached reads)
	itin := v1.Group("/itineraries")
	{
		itin.GET("", cacheItin, itinH.List)
		itin.GET("/:id", cacheItin, itinH.Get)
		itin.POST("", authMW, itinH.Create)
		itin.PUT("/:id", authMW, itinH.Update)
		itin.DELETE("/:id", authMW, itinH.Delete)
		itin.POST("/:id/stops", authMW, itinH.AddStop)
		itin.DELETE("/:id/stops/:stopId", authMW, itinH.DeleteStop)
	}

	// Establishments (cached)
	estab := v1.Group("/establishments")
	{
		estab.GET("", cacheEstab, estabH.List)
		estab.GET("/:id", cacheEstab, estabH.Get)
	}

	// Car Rentals (cached)
	cacheCars := middleware.ResponseCache(apiCache, "cars", cache.TTLMedium)
	cars := v1.Group("/car-rentals")
	{
		cars.GET("", cacheCars, carH.List)
		cars.GET("/:id", cacheCars, carH.Get)
	}

	// Reservations
	resa := v1.Group("/reservations", authMW)
	{
		resa.POST("", resaH.Create)
		resa.GET("/me", resaH.MyReservations)
		resa.GET("/owner", ownerMW, resaH.OwnerReservations)
		resa.GET("/:id", resaH.Get)
		resa.PUT("/:id/cancel", resaH.Cancel)
		resa.PUT("/:id/status", ownerMW, resaH.UpdateStatus)
	}

	// Payments (Stripe)
	payments := v1.Group("/payments")
	{
		payments.POST("/checkout", authMW, paymentH.CreateCheckout)
		payments.POST("/webhook", paymentH.Webhook) // No auth — Stripe calls this
	}

	// Atlas (cached 30min — static historical data)
	v1.GET("/atlas/events", cacheAtlas, atlasH.GetEvents)

	// Wiki (cached)
	wiki := v1.Group("/wiki")
	{
		wiki.GET("/articles", cacheWiki, wikiH.ListArticles)
		wiki.GET("/articles/:slug", cacheWiki, wikiH.GetArticle)
		wiki.POST("/articles", authMW, wikiH.CreateArticle)
		wiki.POST("/articles/:slug/revisions", authMW, wikiH.AddRevision)
		wiki.PUT("/revisions/:id/approve", authMW, adminMW, wikiH.ApproveRevision)
	}

	// Symbols (cached 30min — static cultural data)
	v1.GET("/symbols", cacheSymbols, symbolH.List)

	// Search (cached 1min)
	v1.GET("/search", cacheSearch, searchH.Search)

	// Reviews
	reviews := v1.Group("/reviews")
	{
		reviews.POST("", authMW, reviewH.Create)
		reviews.GET("/places/:placeId", reviewH.ListByPlace)
		reviews.GET("/establishments/:establishmentId", reviewH.ListByEstablishment)
		reviews.PUT("/:id", authMW, reviewH.Update)
		reviews.DELETE("/:id", authMW, reviewH.Delete)
	}

	// Favorites
	favs := v1.Group("/favorites", authMW)
	{
		favs.POST("/toggle", favH.Toggle)
		favs.GET("", favH.List)
		favs.GET("/check/:targetId", favH.Check)
	}

	// Notifications
	notifs := v1.Group("/notifications", authMW)
	{
		notifs.GET("", notifH.List)
		notifs.GET("/unread-count", notifH.UnreadCount)
		notifs.PUT("/:id/read", notifH.MarkRead)
		notifs.PUT("/read-all", notifH.MarkAllRead)
	}

	// Nearby (geospatial search)
	nearby := v1.Group("/nearby")
	{
		nearby.GET("/places", nearbyH.NearbyPlaces)
		nearby.GET("/establishments", nearbyH.NearbyEstablishments)
	}

	// Image upload
	v1.POST("/upload", authMW, imageH.Upload)

	// Ads (public — cached short)
	cacheAds := middleware.ResponseCache(apiCache, "ads", cache.TTLShort)
	adsG := v1.Group("/ads")
	{
		adsG.GET("", cacheAds, adH.GetActiveAds)
		adsG.POST("/:id/click", adH.TrackClick)
	}

	// Owner dashboard
	owner := v1.Group("/owner", authMW, ownerMW)
	{
		owner.GET("/stats", ownerH.GetStats)
		owner.GET("/establishments", ownerH.ListEstablishments)
		owner.GET("/establishments/:id", ownerH.GetEstablishment)
		owner.POST("/establishments", ownerH.CreateEstablishment)
		owner.PUT("/establishments/:id", ownerH.UpdateEstablishment)
		owner.DELETE("/establishments/:id", ownerH.DeleteEstablishment)
		owner.GET("/reservations", ownerH.ListReservations)
		owner.PUT("/reservations/:id/status", ownerH.UpdateReservationStatus)
	}

	// Admin
	admin := v1.Group("/admin", authMW, adminMW)
	{
		admin.GET("/users", adminH.ListUsers)
		admin.PUT("/users/:id/role", adminH.UpdateUserRole)
		admin.DELETE("/users/:id", adminH.DeleteUser)
		admin.GET("/places", adminH.ListPlaces)
		admin.GET("/places/:id", adminH.GetPlace)
		admin.POST("/places", adminH.CreatePlace)
		admin.PUT("/places/:id", adminH.UpdatePlace)
		admin.DELETE("/places/:id", adminH.DeletePlace)
		admin.PUT("/places/:id/active", adminH.TogglePlaceActive)
		admin.PUT("/wiki/articles/:id/approved", adminH.ToggleArticleApproved)
		admin.GET("/stats", adminH.GetStats)
		admin.GET("/ads", adH.AdminList)
		admin.GET("/ads/:id", adH.AdminGet)
		admin.POST("/ads", adH.AdminCreate)
		admin.PUT("/ads/:id", adH.AdminUpdate)
		admin.DELETE("/ads/:id", adH.AdminDelete)

		// Establishments
		admin.GET("/establishments", adminH.ListEstablishments)
		admin.PUT("/establishments/:id/available", adminH.ToggleEstablishmentAvailable)
		admin.DELETE("/establishments/:id", adminH.DeleteEstablishment)

		// Itineraries
		admin.GET("/itineraries", adminH.ListItineraries)
		admin.PUT("/itineraries/:id/public", adminH.ToggleItineraryPublic)
		admin.DELETE("/itineraries/:id", adminH.DeleteItinerary)

		// Reservations
		admin.GET("/reservations", adminH.ListReservations)
		admin.PUT("/reservations/:id/status", adminH.UpdateReservationStatus)

		// Car Rentals
		admin.GET("/car-rentals", adminH.ListCarRentals)
		admin.POST("/car-rentals", adminH.CreateCarRental)
		admin.PUT("/car-rentals/:id", adminH.UpdateCarRental)
		admin.DELETE("/car-rentals/:id", adminH.DeleteCarRental)
		admin.PUT("/car-rentals/:id/available", adminH.ToggleCarRentalAvailable)

		// Regions
		admin.GET("/regions", adminH.ListRegions)
		admin.POST("/regions", adminH.CreateRegion)
		admin.PUT("/regions/:id", adminH.UpdateRegion)
		admin.DELETE("/regions/:id", adminH.DeleteRegion)

		// Symbols
		admin.GET("/symbols", adminH.ListSymbols)
		admin.POST("/symbols", adminH.CreateSymbol)
		admin.PUT("/symbols/:id", adminH.UpdateSymbol)
		admin.DELETE("/symbols/:id", adminH.DeleteSymbol)
	}

	// Public stats
	statsH := handlers.NewStatsHandler(placeRepo, estabRepo, itinRepo, symbolRepo, atlasRepo, wikiRepo, mapRepo)
	v1.GET("/stats", cacheStats, statsH.GetPublicStats)

	registerSystemRoutes(
		r,
		func(ctx context.Context) error {
			sqlDB, err := db.DB()
			if err != nil {
				return err
			}
			return sqlDB.PingContext(ctx)
		},
		func(ctx context.Context) error {
			return rdb.Ping(ctx).Err()
		},
	)

	return r
}
