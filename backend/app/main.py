from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes import api

def create_app() -> FastAPI:
    app = FastAPI(title=settings.PROJECT_NAME)

    # Configure CORS for the Next.js frontend
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routes
    app.include_router(api.router, prefix="/api")

    @app.get("/health")
    def health_check():
        return {"status": "ok", "message": f"{settings.PROJECT_NAME} is running"}

    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
