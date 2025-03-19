# Gemini Image Generation API

A Next.js API for generating and editing images using Google's Gemini 2.0 Flash experimental model.

## Features

- Generate images from text prompts using Gemini 2.0 Flash
- Edit existing images with text instructions
- Store and manage generated images with metadata
- Interactive API documentation with Swagger UI
- Rate limiting and abuse prevention
- Automatic cleanup of old images
- Docker support for easy deployment

## Quick Start with Docker Compose

The easiest way to get started is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/yourusername/gemini-image.git
cd gemini-image

# Create .env.local file with your API key
cp .env.example .env.local
# Edit .env.local to add your API key

# Start the service
./scripts/start.sh
```

The API will be available at `http://localhost:3000` with interactive documentation at `/docs`.

## Docker Configuration

### Using Docker Compose

```bash
# Start the service
docker-compose up -d

# Stop the service
docker-compose down
```

### Manual Docker Setup

```bash
# Build the image
docker build -t gemini-image-api .

# Run the container
docker run -d \
  -p 3000:3000 \
  -e GEMINI_API_KEY=your_api_key_here \
  -v ./data:/app/data \
  -v ./public/generated-images:/app/public/generated-images \
  --name gemini-api \
  gemini-image-api
```

## Local Development

### Prerequisites

- Node.js 18.x or higher
- Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gemini-image.git
cd gemini-image
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```bash
GEMINI_API_KEY=your_api_key_here
RATE_LIMIT=10
RATE_LIMIT_WINDOW_MS=60000
```

4. Start the development server:
```bash
npm run dev
```

## API Documentation

Interactive API documentation is available at:
- Swagger UI: `http://localhost:3000/docs`
- OpenAPI Spec: `http://localhost:3000/api/docs`

### Key Endpoints

- `POST /api/generate` - Generate images from text prompts
- `POST /api/edit` - Edit existing images
- `GET /api/images` - List generated images
- `GET /api/images/{id}` - Get image metadata
- `DELETE /api/images/{id}` - Delete specific image
- `DELETE /api/images` - Cleanup old images
- `GET /api/health` - Health check endpoint for monitoring

## Example Usage

### Generate an Image

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A 3D rendered robot puppy playing with a glowing blue ball",
    "options": {
      "format": "png",
      "quality": 90
    }
  }'
```

### Edit an Image

```bash
curl -X POST http://localhost:3000/api/edit \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Make the robot puppy gold colored",
    "imageUrl": "/generated-images/example.png"
  }'
```

### List Images

```bash
curl "http://localhost:3000/api/images?limit=10&offset=0"
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | Required |
| `RATE_LIMIT` | Requests per window | 10 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 60000 |

### Docker Volumes

The Docker setup includes two persistent volumes:

- `./data:/app/data` - Stores image metadata
- `./public/generated-images:/app/public/generated-images` - Stores generated images

### Storage Structure

- `/public/generated-images/` - Generated image files
- `/data/metadata/` - Image metadata JSON files

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": "Optional details"
  }
}
```

Common error codes:
- `MISSING_PROMPT` - Prompt is required
- `MISSING_IMAGE_URL` - Image URL is required
- `NO_IMAGE_GENERATED` - Generation failed
- `IMAGE_NOT_FOUND` - Image not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `GENERATION_FAILED` - Gemini API error
- `EDIT_FAILED` - Image editing failed

## Security Considerations

1. API Key Protection
   - Store GEMINI_API_KEY securely
   - Use environment variables
   - Never commit API keys

2. Rate Limiting
   - Prevents abuse and DoS
   - Configurable limits
   - IP-based tracking

3. Input Validation
   - Prompt length limits
   - File size checks
   - MIME type validation

4. Docker Security
   - Non-root user
   - Minimal base image
   - Volume permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Google Gemini API](https://ai.google.dev/gemini-api)
- [Next.js](https://nextjs.org/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Docker](https://www.docker.com/)