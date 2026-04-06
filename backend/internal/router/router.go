package router

import (
	"github.com/faso-atlas/backend/internal/config"
	"github.com/faso-atlas/backend/internal/handlers"
	"github.com/faso-atlas/backend/internal/middleware"
	pkgjwt "github.com/faso-atlas/backend/pkg/jwt"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

func New(db *gorm.DB, rdb *redis.Client, cfg *config.Config) *gin.Engine {
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()
	r.Use(middleware.CORS(cfg.AllowedOrigins))

	jwtManager := pkgjwt.NewManager(cfg.JWTSecret)
	authMW := middleware.Auth(jwtManager)
	adminMW := middleware.RequireRole("admin")
	ownerMW := middleware.RequireRole("owner", "admin")

	// Handlers
	authH := handlers.NewAuthHandler(db, jwtManager)
	mapH := handlers.NewMapHandler(db, rdb)
	destH := handlers.NewDestinationHandler(db)
	estabH := handlers.NewEstablishmentHandler(db)
	resaH := handlers.NewReservationHandler(db)
	itinH := handlers.NewItineraryHandler(db)
	atlasH := handlers.NewAtlasHandler(db)
	wikiH := handlers.NewWikiHandler(db)
	symbolH := handlers.NewSymbolHandler(db)
	searchH := handlers.NewSearchHandler(db)

	v1 := r.Group("/api/v1")

	// Auth
	auth := v1.Group("/auth")
	{
		auth.POST("/register", authH.Register)
		auth.POST("/login", authH.Login)
		auth.GET("/me", authMW, authH.Me)
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

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "faso-atlas-api"})
	})

	return r
}
