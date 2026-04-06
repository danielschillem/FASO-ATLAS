package services

import (
	"context"
	"log/slog"

	"github.com/faso-atlas/backend/internal/models"
	"github.com/faso-atlas/backend/internal/repository"
	"github.com/faso-atlas/backend/pkg/apperror"
	"github.com/faso-atlas/backend/pkg/validator"
	"github.com/microcosm-cc/bluemonday"
)

type WikiService struct {
	repo      repository.WikiRepository
	sanitizer *bluemonday.Policy
	logger    *slog.Logger
}

func NewWikiService(repo repository.WikiRepository, logger *slog.Logger) *WikiService {
	return &WikiService{repo: repo, sanitizer: bluemonday.UGCPolicy(), logger: logger}
}

func (s *WikiService) ListArticles(ctx context.Context, offset, limit int, category string) ([]models.WikiArticle, int64, *apperror.AppError) {
	articles, total, err := s.repo.ListArticles(ctx, offset, limit, category)
	if err != nil {
		return nil, 0, apperror.Internal("failed to fetch articles")
	}
	return articles, total, nil
}

func (s *WikiService) GetArticle(ctx context.Context, slug string) (*models.WikiArticle, *apperror.AppError) {
	article, err := s.repo.GetArticleBySlug(ctx, slug)
	if err != nil {
		return nil, apperror.NotFound("article")
	}
	_ = s.repo.IncrementViewCount(ctx, article.ID)
	return article, nil
}

type CreateArticleInput struct {
	UserID      uint
	Title       string
	Slug        string
	Subtitle    string
	Category    string
	LeadText    string
	BodyHTML     string
	InfoboxData models.InfoboxData
	Tags        []string
}

func (s *WikiService) CreateArticle(ctx context.Context, input CreateArticleInput) (*models.WikiArticle, *apperror.AppError) {
	if !validator.ValidateSlug(input.Slug) {
		return nil, apperror.Validation(map[string]string{
			"slug": "must be lowercase letters, numbers, and hyphens only",
		})
	}

	article := models.WikiArticle{
		Slug:        input.Slug,
		Title:       validator.SanitizeString(input.Title, 200),
		Subtitle:    validator.SanitizeString(input.Subtitle, 300),
		Category:    input.Category,
		LeadText:    validator.SanitizeString(input.LeadText, 1000),
		BodyHTML:    s.sanitizer.Sanitize(input.BodyHTML),
		InfoboxData: input.InfoboxData,
		Tags:        input.Tags,
		AuthorID:    &input.UserID,
		IsApproved:  false,
	}

	if err := s.repo.CreateArticle(ctx, &article); err != nil {
		return nil, apperror.Conflict("slug already exists")
	}

	s.logger.InfoContext(ctx, "wiki article created", "slug", input.Slug, "authorID", input.UserID)
	return &article, nil
}

type AddRevisionInput struct {
	UserID   uint
	Slug     string
	BodyHTML string
	Summary  string
}

func (s *WikiService) AddRevision(ctx context.Context, input AddRevisionInput) (*models.WikiRevision, *apperror.AppError) {
	article, err := s.repo.GetArticleBySlug(ctx, input.Slug)
	if err != nil {
		return nil, apperror.NotFound("article")
	}

	revision := models.WikiRevision{
		ArticleID: article.ID,
		AuthorID:  input.UserID,
		BodyHTML:  s.sanitizer.Sanitize(input.BodyHTML),
		Summary:   validator.SanitizeString(input.Summary, 300),
	}
	if err := s.repo.CreateRevision(ctx, &revision); err != nil {
		return nil, apperror.Internal("failed to create revision")
	}
	return &revision, nil
}

func (s *WikiService) ApproveRevision(ctx context.Context, revisionID uint) *apperror.AppError {
	rev, err := s.repo.GetRevisionByID(ctx, revisionID)
	if err != nil {
		return apperror.NotFound("revision")
	}

	if err := s.repo.ApplyRevision(ctx, rev.ArticleID, rev.BodyHTML); err != nil {
		return apperror.Internal("failed to apply revision")
	}

	s.logger.InfoContext(ctx, "revision approved", "revisionID", revisionID, "articleID", rev.ArticleID)
	return nil
}
