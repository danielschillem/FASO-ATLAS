package router

import (
	"log/slog"
	"time"

	"github.com/faso-atlas/backend/internal/config"
	"github.com/faso-atlas/backend/internal/handlers"
	"github.com/faso-atlas/backend/internal/middleware"
	"github.com/faso-atlas/backend/internal/repository"
	"github.com/faso-atlas/backend/internal/services"
	pkgjwt "github.com/faso-atlas/backend/pkg/jwt"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func New(db *gorm.DB, rdb *redis.Client, cfg *config.Config, logger *slog.Logger) *gin.Engine {
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()

	// Global middleware stack
	r.Use(middleware.RequestID())
	r.Use(middleware.Recovery())
	r.Use(gin.Logger())
	r.Use(middleware.CORS(cfg.AllowedOrigins))
	r.Use(middleware.ErrorHandler())

	jwtManager := pkgjwt.NewManager(cfg.JWTSecret)
	authMW := middleware.Auth(jwtManager)
	adminMW := middleware.RequireRole("admin")
	ownerMW := middleware.RequireRole("owner", "admin")

	// Rate limiter for auth endpoints (10 req / minute)
	authLimiter := middleware.RateLimiter(10, 1*time.Minute)

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

	// --- Services ---
	authSvc := services.NewAuthService(userRepo, tokenRepo, jwtManager, logger)
	mapSvc := services.NewMapService(mapRepo, logger)
	resaSvc := services.NewReservationService(resaRepo, estabRepo, logger)
	wikiSvc := services.NewWikiService(wikiRepo, logger)
	reviewSvc := services.NewReviewService(reviewRepo, placeRepo, logger)
	adminSvc := services.NewAdminService(userRepo, placeRepo, wikiRepo, logger)

	// --- Handlers ---
	authH := handlers.NewAuthHandler(authSvc)
	mapH := handlers.NewMapHandler(mapSvc)
	destH := handlers.NewDestinationHandler(placeRepo)
	estabH := handlers.NewEstablishmentHandler(estabRepo)
	resaH := handlers.NewReservationHandler(resaSvc)
	itinH := handlers.NewItineraryHandler(itinRepo)
	atlasH := handlers.NewAtlasHandler(atlasRepo)
	wikiH := handlers.NewWikiHandler(wikiSvc)
	symbolH := handlers.NewSymbolHandler(symbolRepo)
	searchH := handlers.NewSearchHandler(placeRepo, estabRepo, wikiRepo, itinRepo)
	reviewH := handlers.NewReviewHandler(reviewSvc)
	adminH := handlers.NewAdminHandler(adminSvc)

	v1 := r.Group("/api/v1")

	// Auth (rate-limited)
	auth := v1.Group("/auth", authLimiter)
	{
		auth.POST("/register", authH.Register)
		auth.POST("/login", authH.Login)
		auth.POST("/refresh", authH.Refresh)
		auth.GET("/me", authMW, authH.Me)
		auth.POST("/verify-email", authH.VerifyEmail)
		auth.POST("/request-verification", authMW, authH.RequestVerification)
		auth.POST("/forgot-password", authH.ForgotPassword)
		auth.POST("/reset-password", authH.ResetPassword)
	}

	// Map
	mapG := v1.Group("/map")
	{
		mapG.GET("/places", mapH.GetPlaces)
		mapG.GET("/places/:id", mapH.GetPlace)
		mapG.GET("/regions", mapH.GetRegions)
	}

	// Destinations
	dest := v1.Group("/destinations")
	{
		dest.GET("/", destH.List)
		dest.GET("/:slug", destH.Get)
	}

	// Itineraries
	itin := v1.Group("/itineraries")
	{
		itin.GET("/", itinH.List)
		itin.GET("/:id", itinH.Get)
		itin.POST("/", authMW, itinH.Create)
		itin.POST("/:id/stops", authMW, itinH.AddStop)
		itin.DELETE("/:id/stops/:stopId", authMW, itinH.DeleteStop)
	}

	// Establishments
	estab := v1.Group("/establishments")
	{
		estab.GET("/", estabH.List)
		estab.GET("/:id", estabH.Get)
	}

	// Reservations
	resa := v1.Group("/reservations", authMW)
	{
		resa.POST("/", resaH.Create)
		resa.GET("/me", resaH.MyReservations)
		resa.GET("/:id", resaH.Get)
		resa.PUT("/:id/cancel", resaH.Cancel)
		resa.PUT("/:id/status", ownerMW, resaH.UpdateStatus)
	}

	// Atlas
	v1.GET("/atlas/events", atlasH.GetEvents)

	// Wiki
	wiki := v1.Group("/wiki")
	{
		wiki.GET("/articles", wikiH.ListArticles)
		wiki.GET("/articles/:slug", wikiH.GetArticle)
		wiki.POST("/articles", authMW, wikiH.CreateArticle)
		wiki.POST("/articles/:slug/revisions", authMW, wikiH.AddRevision)
		wiki.PUT("/revisions/:id/approve", authMW, adminMW, wikiH.ApproveRevision)
	}

	// Symbols
	v1.GET("/symbols", symbolH.List)

	// Search
	v1.GET("/search", searchH.Search)

	// Reviews
	reviews := v1.Group("/reviews")
	{
		reviews.POST("/", authMW, reviewH.Create)
		reviews.GET("/places/:placeId", reviewH.ListByPlace)
		reviews.GET("/establishments/:establishmentId", reviewH.ListByEstablishment)
		reviews.PUT("/:id", authMW, reviewH.Update)
		reviews.DELETE("/:id", authMW, reviewH.Delete)
	}

	// Admin
	admin := v1.Group("/admin", authMW, adminMW)
	{
		admin.GET("/users", adminH.ListUsers)
		admin.PUT("/users/:id/role", adminH.UpdateUserRole)
		admin.DELETE("/users/:id", adminH.DeleteUser)
		admin.PUT("/places/:id/active", adminH.TogglePlaceActive)
		admin.PUT("/wiki/articles/:id/approved", adminH.ToggleArticleApproved)
		admin.GET("/stats", adminH.GetStats)
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "faso-atlas-api"})
	})

	return r
}
