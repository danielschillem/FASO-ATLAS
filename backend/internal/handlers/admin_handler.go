package handlers

import (
	"net/http"
	"strconv"

	"github.com/faso-atlas/backend/internal/models"
	"github.com/faso-atlas/backend/internal/repository"
	"github.com/faso-atlas/backend/internal/services"
	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/faso-atlas/backend/pkg/pagination"
	"github.com/gin-gonic/gin"
)

type AdminHandler struct {
	admin   *services.AdminService
	estabs  repository.EstablishmentRepository
	itins   repository.ItineraryRepository
	resas   repository.ReservationRepository
	cars    repository.CarRentalRepository
	symbols repository.SymbolRepository
	regions repository.RegionRepository
}

func NewAdminHandler(
	admin *services.AdminService,
	estabs repository.EstablishmentRepository,
	itins repository.ItineraryRepository,
	resas repository.ReservationRepository,
	cars repository.CarRentalRepository,
	symbols repository.SymbolRepository,
	regions repository.RegionRepository,
) *AdminHandler {
	return &AdminHandler{
		admin:   admin,
		estabs:  estabs,
		itins:   itins,
		resas:   resas,
		cars:    cars,
		symbols: symbols,
		regions: regions,
	}
}

func (h *AdminHandler) ListUsers(c *gin.Context) {
	p := pagination.Parse(c, 20)
	users, total, appErr := h.admin.ListUsers(c.Request.Context(), p.Offset, p.Limit)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(c, users, total, p))
}

func (h *AdminHandler) UpdateUserRole(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	var req struct {
		Role models.UserRole `json:"role" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}

	user, appErr := h.admin.UpdateUserRole(c.Request.Context(), uint(id), req.Role)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, user)
}

func (h *AdminHandler) DeleteUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	if appErr := h.admin.DeleteUser(c.Request.Context(), uint(id)); appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "user deleted"})
}

func (h *AdminHandler) TogglePlaceActive(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	var req struct {
		Active bool `json:"active"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	if appErr := h.admin.TogglePlaceActive(c.Request.Context(), uint(id), req.Active); appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "place updated"})
}

func (h *AdminHandler) ToggleArticleApproved(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	var req struct {
		Approved bool `json:"approved"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	if appErr := h.admin.ToggleArticleApproved(c.Request.Context(), uint(id), req.Approved); appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "article updated"})
}

func (h *AdminHandler) GetStats(c *gin.Context) {
	stats, appErr := h.admin.GetStats(c.Request.Context())
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, stats)
}

// ─── Admin Place CRUD ───

func (h *AdminHandler) ListPlaces(c *gin.Context) {
	p := pagination.Parse(c, 20)
	places, total, appErr := h.admin.ListPlaces(c.Request.Context(), p.Offset, p.Limit)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(c, places, total, p))
}

func (h *AdminHandler) GetPlace(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	place, appErr := h.admin.GetPlace(c.Request.Context(), uint(id))
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, place)
}

func (h *AdminHandler) CreatePlace(c *gin.Context) {
	var req services.CreatePlaceInput
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	place, appErr := h.admin.CreatePlace(c.Request.Context(), req)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusCreated, place)
}

func (h *AdminHandler) UpdatePlace(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	var req services.CreatePlaceInput
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	place, appErr := h.admin.UpdatePlace(c.Request.Context(), uint(id), req)
	if appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, place)
}

func (h *AdminHandler) DeletePlace(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	if appErr := h.admin.DeletePlace(c.Request.Context(), uint(id)); appErr != nil {
		c.JSON(appErr.HTTPStatus, appErr)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "place deleted"})
}

// ─── Admin Establishments ───

func (h *AdminHandler) ListEstablishments(c *gin.Context) {
	p := pagination.Parse(c, 20)
	list, total, err := h.estabs.ListAll(c.Request.Context(), p.Offset, p.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to fetch establishments"))
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(c, list, total, p))
}

func (h *AdminHandler) ToggleEstablishmentAvailable(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	var req struct {
		Available bool `json:"available"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	if err := h.estabs.SetAvailable(c.Request.Context(), uint(id), req.Available); err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to update establishment"))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "establishment updated"})
}

func (h *AdminHandler) DeleteEstablishment(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	if err := h.estabs.Delete(c.Request.Context(), uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to delete establishment"))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "establishment deleted"})
}

// ─── Admin Itineraries ───

func (h *AdminHandler) ListItineraries(c *gin.Context) {
	p := pagination.Parse(c, 20)
	list, total, err := h.itins.ListAll(c.Request.Context(), p.Offset, p.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to fetch itineraries"))
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(c, list, total, p))
}

func (h *AdminHandler) ToggleItineraryPublic(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	var req struct {
		Public bool `json:"public"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	if err := h.itins.SetPublic(c.Request.Context(), uint(id), req.Public); err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to update itinerary"))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "itinerary updated"})
}

func (h *AdminHandler) DeleteItinerary(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	if err := h.itins.Delete(c.Request.Context(), uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to delete itinerary"))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "itinerary deleted"})
}

// ─── Admin Reservations ───

func (h *AdminHandler) ListReservations(c *gin.Context) {
	p := pagination.Parse(c, 20)
	list, total, err := h.resas.ListAll(c.Request.Context(), p.Offset, p.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to fetch reservations"))
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(c, list, total, p))
}

func (h *AdminHandler) UpdateReservationStatus(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	var req struct {
		Status models.ReservationStatus `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	if err := h.resas.UpdateStatus(c.Request.Context(), uint(id), req.Status); err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to update reservation"))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "reservation updated"})
}

// ─── Admin Car Rentals ───

func (h *AdminHandler) ListCarRentals(c *gin.Context) {
	p := pagination.Parse(c, 20)
	list, total, err := h.cars.ListAll(c.Request.Context(), p.Offset, p.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to fetch car rentals"))
		return
	}
	c.JSON(http.StatusOK, pagination.NewResponse(c, list, total, p))
}

func (h *AdminHandler) CreateCarRental(c *gin.Context) {
	var car models.CarRental
	if err := c.ShouldBindJSON(&car); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	if err := h.cars.Create(c.Request.Context(), &car); err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to create car rental"))
		return
	}
	c.JSON(http.StatusCreated, car)
}

func (h *AdminHandler) UpdateCarRental(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	existing, err := h.cars.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, apperror.NotFound("car rental"))
		return
	}
	if err := c.ShouldBindJSON(existing); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	existing.ID = uint(id)
	if err := h.cars.Update(c.Request.Context(), existing); err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to update car rental"))
		return
	}
	c.JSON(http.StatusOK, existing)
}

func (h *AdminHandler) DeleteCarRental(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	if err := h.cars.Delete(c.Request.Context(), uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to delete car rental"))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "car rental deleted"})
}

func (h *AdminHandler) ToggleCarRentalAvailable(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	var req struct {
		Available bool `json:"available"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	if err := h.cars.SetAvailable(c.Request.Context(), uint(id), req.Available); err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to update car rental"))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "car rental updated"})
}

// ─── Admin Regions ───

func (h *AdminHandler) ListRegions(c *gin.Context) {
	list, err := h.regions.List(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to fetch regions"))
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list, "total": len(list)})
}

func (h *AdminHandler) CreateRegion(c *gin.Context) {
	var region models.Region
	if err := c.ShouldBindJSON(&region); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	if err := h.regions.Create(c.Request.Context(), &region); err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to create region"))
		return
	}
	c.JSON(http.StatusCreated, region)
}

func (h *AdminHandler) UpdateRegion(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	existing, err := h.regions.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, apperror.NotFound("region"))
		return
	}
	if err := c.ShouldBindJSON(existing); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	existing.ID = uint(id)
	if err := h.regions.Update(c.Request.Context(), existing); err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to update region"))
		return
	}
	c.JSON(http.StatusOK, existing)
}

func (h *AdminHandler) DeleteRegion(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	if err := h.regions.Delete(c.Request.Context(), uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to delete region"))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "region deleted"})
}

// ─── Admin Symbols ───

func (h *AdminHandler) ListSymbols(c *gin.Context) {
	list, err := h.symbols.List(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to fetch symbols"))
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list, "total": len(list)})
}

func (h *AdminHandler) CreateSymbol(c *gin.Context) {
	var symbol models.Symbol
	if err := c.ShouldBindJSON(&symbol); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	if err := h.symbols.Create(c.Request.Context(), &symbol); err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to create symbol"))
		return
	}
	c.JSON(http.StatusCreated, symbol)
}

func (h *AdminHandler) UpdateSymbol(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	existing, err := h.symbols.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, apperror.NotFound("symbol"))
		return
	}
	if err := c.ShouldBindJSON(existing); err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest(err.Error()))
		return
	}
	existing.ID = uint(id)
	if err := h.symbols.Update(c.Request.Context(), existing); err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to update symbol"))
		return
	}
	c.JSON(http.StatusOK, existing)
}

func (h *AdminHandler) DeleteSymbol(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, apperror.BadRequest("invalid id"))
		return
	}
	if err := h.symbols.Delete(c.Request.Context(), uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, apperror.Internal("failed to delete symbol"))
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "symbol deleted"})
}
