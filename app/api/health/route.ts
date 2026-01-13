import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import redisClient from "@/lib/redis";

export const dynamic = "force-dynamic";

interface ServiceStatus {
  status: "up" | "down" | "not_configured";
  message: string;
  responseTime?: number;
}

interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  services: {
    postgres: ServiceStatus;
    redis: ServiceStatus;
  };
}

export async function GET() {
  const timestamp = new Date().toISOString();
  const services: HealthResponse["services"] = {
    postgres: { status: "down", message: "Not checked" },
    redis: { status: "down", message: "Not checked" },
  };

  // Check PostgreSQL
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;
    services.postgres = {
      status: "up",
      message: "Connected",
      responseTime,
    };
  } catch (error: any) {
    services.postgres = {
      status: "down",
      message: error.message || "Connection failed",
    };
  }

  // Check Redis
  if (!redisClient) {
    services.redis = {
      status: "not_configured",
      message: "Redis not configured",
    };
  } else {
    try {
      const start = Date.now();
      await redisClient.ping();
      const responseTime = Date.now() - start;
      services.redis = {
        status: "up",
        message: "Connected",
        responseTime,
      };
    } catch (error: any) {
      services.redis = {
        status: "down",
        message: error.message || "Connection failed",
      };
    }
  }

  // Determine overall status
  let overallStatus: HealthResponse["status"] = "healthy";
  if (services.postgres.status === "down") {
    overallStatus = "unhealthy";
  } else if (services.redis.status === "down") {
    overallStatus = "degraded";
  }

  const response: HealthResponse = {
    status: overallStatus,
    timestamp,
    services,
  };

  const statusCode = overallStatus === "unhealthy" ? 503 : 200;

  return NextResponse.json(response, { status: statusCode });
}
