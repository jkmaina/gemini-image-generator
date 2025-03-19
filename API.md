# Gemini Image API Reference

This document provides detailed technical information about the Gemini Image API endpoints, request/response formats, and error handling.

## Base URL

All API endpoints are relative to your base URL:

```
http://localhost:3000/api
```

## Docker Deployment

The API can be easily deployed using Docker:

```bash
# Build the image
docker build -t gemini-image-api .

# Run the container
docker run -d \
  -p 3000:3000 \
  -e GEMINI_API_KEY=your_api_key_here \
  --name gemini-api \
  gemini-image-api
```

For production deployments, consider:
- Using Docker volumes for persistent storage
- Setting up a reverse proxy with HTTPS
- Implementing proper authentication
- Using environment-specific configuration

## Common Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data varies by endpoint
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (optional)"
  }
}
```

## API Endpoints

### Generate Image

Generate a new image from a text prompt using Gemini 2.0 Flash.

**Endpoint:** `POST /generate`

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `prompt` | string | **Required**. Text description of the image to generate |
| `options` | object | **Optional**. Image generation options |
| `options.format` | string | Image format: "png", "jpeg", or "webp" |
| `options.quality` | number | Image quality (1-100) |

**Example Request:**
```json
{
  "prompt": "A 3D rendered robot puppy playing with a glowing blue ball in a futuristic park",
  "options": {
    "format": "png",
    "quality": 90
  }
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "imageUrl": "/generated-images/f350adb290046c5fd7d46298d677b922.png",
    "description": null,
    "metadata": {
      "id": "1b629472-cc42-4dc3-ad1f-a7dce5945260",
      "prompt": "A 3D rendered robot puppy playing with a glowing blue ball in a futuristic park",
      "createdAt": "2025-03-18T15:05:49.809Z",
      "filename": "f350adb290046c5fd7d46298d677b922.png",
      "mimeType": "image/png",
      "size": 834416,
      "url": "/generated-images/f350adb290046c5fd7d46298d677b922.png"
    }
  }
}
```

**Error Responses:**

- `400 Bad Request`: Missing prompt
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Generation failed

### Edit Image

Edit an existing image using a text prompt and Gemini's image editing capabilities.

**Endpoint:** `POST /edit`

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| `prompt` | string | **Required**. Text description of the edits to make |
| `imageUrl` | string | **Required**. URL of the image to edit (can be a local path like "/generated-images/filename.png" or an external URL) |

**Example Request:**
```json
{
  "prompt": "Make the robot puppy gold colored instead of silver",
  "imageUrl": "/generated-images/f350adb290046c5fd7d46298d677b922.png"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "imageUrl": "/generated-images/028e6b6e73630b8c8ae068ddf5f24a21.png",
    "description": null,
    "metadata": {
      "id": "2ab9d1f0-129f-4913-b5bb-3caba343f4eb",
      "prompt": "Make the robot puppy gold colored instead of silver",
      "createdAt": "2025-03-18T15:07:01.752Z",
      "filename": "028e6b6e73630b8c8ae068ddf5f24a21.png",
      "mimeType": "image/png",
      "size": 775574,
      "url": "/generated-images/028e6b6e73630b8c8ae068ddf5f24a21.png"
    }
  }
}
```

**Error Responses:**

- `400 Bad Request`: Missing prompt or image URL
- `404 Not Found`: Image not found
- `500 Internal Server Error`: Edit failed

### List Images

List all generated images with pagination.

**Endpoint:** `GET /images`

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | **Optional**. Maximum number of images to return (default: 100) |
| `offset` | number | **Optional**. Number of images to skip (default: 0) |

**Example Request:**
```
GET /api/images?limit=10&offset=0
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "id": "1b629472-cc42-4dc3-ad1f-a7dce5945260",
        "prompt": "A 3D rendered robot puppy playing with a glowing blue ball in a futuristic park",
        "createdAt": "2025-03-18T15:05:49.809Z",
        "filename": "f350adb290046c5fd7d46298d677b922.png",
        "mimeType": "image/png",
        "size": 834416,
        "url": "/generated-images/f350adb290046c5fd7d46298d677b922.png"
      },
      // More images...
    ],
    "pagination": {
      "limit": 10,
      "offset": 0,
      "total": 3
    }
  }
}
```

**Error Response:**

- `500 Internal Server Error`: List failed

### Get Image Metadata

Get metadata for a specific image by ID.

**Endpoint:** `GET /images/{imageId}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `imageId` | string | **Required**. ID of the image |

**Example Request:**
```
GET /api/images/1b629472-cc42-4dc3-ad1f-a7dce5945260
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "metadata": {
      "id": "1b629472-cc42-4dc3-ad1f-a7dce5945260",
      "prompt": "A 3D rendered robot puppy playing with a glowing blue ball in a futuristic park",
      "createdAt": "2025-03-18T15:05:49.809Z",
      "filename": "f350adb290046c5fd7d46298d677b922.png",
      "mimeType": "image/png",
      "size": 834416,
      "url": "/generated-images/f350adb290046c5fd7d46298d677b922.png"
    }
  }
}
```

**Error Responses:**

- `404 Not Found`: Image not found
- `500 Internal Server Error`: Get metadata failed

### Delete Image

Delete a specific image by ID.

**Endpoint:** `DELETE /images/{imageId}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `imageId` | string | **Required**. ID of the image to delete |

**Example Request:**
```
DELETE /api/images/2ab9d1f0-129f-4913-b5bb-3caba343f4eb
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Image 2ab9d1f0-129f-4913-b5bb-3caba343f4eb deleted successfully"
  }
}
```

**Error Responses:**

- `404 Not Found`: Image not found
- `500 Internal Server Error`: Delete failed

### Cleanup Old Images

Delete images older than a specified number of days.

**Endpoint:** `DELETE /images`

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `maxAge` | number | **Optional**. Maximum age in days (default: 7) |

**Example Request:**
```
DELETE /api/images?maxAge=7
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "deletedCount": 3,
    "maxAge": 7
  }
}
```

**Error Response:**

- `500 Internal Server Error`: Cleanup failed

## Rate Limiting

The API implements rate limiting to prevent abuse. By default, it allows 10 requests per minute per IP address.

When the rate limit is exceeded, the API returns a `429 Too Many Requests` response:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later."
  }
}
```

## Image Storage

Generated images are stored in the `/public/generated-images/` directory and are accessible via URLs like:

```
http://localhost:3000/generated-images/f350adb290046c5fd7d46298d677b922.png
```

Image metadata is stored in the `/data/metadata/` directory as JSON files.

## Docker Volume Persistence

For production deployments, you should use Docker volumes to persist image data:

```bash
docker run -d \
  -p 3000:3000 \
  -e GEMINI_API_KEY=your_api_key_here \
  -v gemini_images:/app/public/generated-images \
  -v gemini_metadata:/app/data/metadata \
  --name gemini-api \
  gemini-image-api
```

## Security Best Practices

1. **API Key Protection**
   - Store your Gemini API key securely
   - Use environment variables
   - Consider using a secrets manager for production

2. **Input Validation**
   - All endpoints validate input parameters
   - Prompt length is limited
   - File sizes are checked

3. **Rate Limiting**
   - Prevents abuse and DoS attacks
   - Configurable via environment variables
   - IP-based tracking

4. **Error Handling**
   - Consistent error format
   - No sensitive information in errors
   - Appropriate HTTP status codes

5. **Docker Security**
   - Non-root user in container
   - Minimal base image
   - Proper file permissions

## Performance Considerations

1. **Image Optimization**
   - Consider implementing image compression
   - Add support for WebP format
   - Implement caching headers

2. **Rate Limiting**
   - Adjust based on your server capacity
   - Consider using Redis for distributed rate limiting

3. **Cleanup Policy**
   - Implement a regular cleanup schedule
   - Consider storage quotas per user
   - Monitor disk usage

## Troubleshooting

### Common Issues

1. **API Key Issues**
   - Verify your Gemini API key is correct
   - Check environment variables are properly set
   - Ensure API key has proper permissions

2. **Image Generation Failures**
   - Check Gemini API status
   - Verify prompt is appropriate
   - Check for rate limiting or quota issues

3. **Storage Issues**
   - Verify write permissions to storage directories
   - Check disk space
   - Ensure Docker volumes are properly mounted

### Logging

The API logs errors to the console. In Docker, you can view logs with:

```bash
docker logs gemini-api
```

## API Versioning

This is version 1.0.0 of the API. Future versions will maintain backward compatibility or provide clear migration paths.