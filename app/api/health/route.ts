import { NextResponse } from "next/server";
import { ApiResponse } from "@/lib/types";

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: healthy
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     version:
 *                       type: string
 *                       example: 0.1.0
 */
export async function GET() {
  // Get package version
  const packageJson = require("../../../package.json");
  
  return NextResponse.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: packageJson.version
    }
  } as ApiResponse);
}