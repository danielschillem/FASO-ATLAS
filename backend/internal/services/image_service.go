package services

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"path/filepath"
	"strings"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

type ImageService struct {
	cld    *cloudinary.Cloudinary
	logger *slog.Logger
}

func NewImageService(cloudinaryURL string, logger *slog.Logger) *ImageService {
	url := strings.TrimSpace(cloudinaryURL)
	if url == "" || strings.EqualFold(url, "null") || strings.EqualFold(url, "disabled") || strings.HasPrefix(url, "${") {
		// Cloudinary is optional — upload feature simply unavailable, no log needed
		return &ImageService{logger: logger}
	}

	cld, err := cloudinary.NewFromURL(url)
	if err != nil {
		logger.Warn("Cloudinary URL invalid; /api/v1/upload disabled", "error", err)
		return &ImageService{logger: logger}
	}
	logger.Info("Cloudinary configured")
	return &ImageService{cld: cld, logger: logger}
}

var allowedExtensions = map[string]bool{
	".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".gif": true,
}

func (s *ImageService) Upload(ctx context.Context, file io.Reader, filename string, folder string) (string, error) {
	if s.cld == nil {
		return "", fmt.Errorf("cloudinary not configured")
	}

	ext := strings.ToLower(filepath.Ext(filename))
	if !allowedExtensions[ext] {
		return "", fmt.Errorf("file type %s not allowed", ext)
	}

	uploadResult, err := s.cld.Upload.Upload(ctx, file, uploader.UploadParams{
		Folder:         "faso-atlas/" + folder,
		Transformation: "c_limit,w_1600,q_auto,f_auto",
	})
	if err != nil {
		s.logger.Error("Cloudinary upload failed", "error", err)
		return "", fmt.Errorf("upload failed: %w", err)
	}

	return uploadResult.SecureURL, nil
}

func (s *ImageService) Delete(ctx context.Context, publicID string) error {
	if s.cld == nil {
		return fmt.Errorf("cloudinary not configured")
	}
	_, err := s.cld.Upload.Destroy(ctx, uploader.DestroyParams{PublicID: publicID})
	return err
}
