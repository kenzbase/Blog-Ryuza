from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import bcrypt
import jwt
import re


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-here')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# User Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    username: str
    password_hash: str
    full_name: str
    bio: str = ""
    avatar_url: str = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    saldo: int = 0
    level: str = "Basic"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UsernameSelect(BaseModel):
    username: str

class UserProfile(BaseModel):
    id: str
    email: str
    username: str
    full_name: str
    bio: str
    avatar_url: str
    saldo: int
    level: str
    created_at: datetime
    is_active: bool

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

# Portfolio Models (updated with user_id)
class HoverItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    subtitle: str
    description: str
    detailed_description: str
    category: str
    image_url: str
    gallery_images: List[str] = []
    hover_content: str
    fun_fact: str
    tech_stack: List[str] = []
    features: List[str] = []
    challenges: List[str] = []
    solutions: List[str] = []
    link_url: Optional[str] = None
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    duration: str = ""
    team_size: int = 1
    status: str = "completed"
    views: int = 0

class HoverItemCreate(BaseModel):
    title: str
    subtitle: str
    description: str
    detailed_description: str
    category: str
    image_url: str
    gallery_images: List[str] = []
    hover_content: str
    fun_fact: str
    tech_stack: List[str] = []
    features: List[str] = []
    challenges: List[str] = []
    solutions: List[str] = []
    link_url: Optional[str] = None
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    duration: str = ""
    team_size: int = 1
    status: str = "completed"

# Authentication Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**user)

def validate_username(username: str) -> bool:
    # Username must be 3-30 characters, alphanumeric + underscore, no spaces
    pattern = r'^[a-zA-Z0-9_]{3,30}$'
    return bool(re.match(pattern, username))

# Sample data initialization
async def init_sample_data():
    """Initialize sample user and portfolio data"""
    # Check if sample user exists
    sample_user = await db.users.find_one({"email": "demo@hoverboard.com"})
    if not sample_user:
        # Create sample user
        sample_user_data = User(
            email="demo@hoverboard.com",
            username="demo_user",
            password_hash=hash_password("demo123"),
            full_name="Demo User",
            bio="This is a demo user account for HoverBoard showcase",
            saldo=2500000,
            level="Premium"
        )
        await db.users.insert_one(sample_user_data.dict())
        sample_user = sample_user_data.dict()
    
    # Check if sample portfolio exists
    count = await db.hover_items.count_documents({"user_id": sample_user["id"]})
    if count == 0:
        sample_items = [
            HoverItemCreate(
                title="Website Portfolio",
                subtitle="React & Node.js",
                description="Portfolio modern dengan animasi interaktif yang menawan",
                detailed_description="Sebuah website portfolio yang dirancang khusus untuk menampilkan karya-karya terbaik dengan pengalaman pengguna yang luar biasa. Website ini menggunakan teknologi terdepan seperti React untuk frontend yang responsif, Node.js untuk backend yang powerful, dan MongoDB untuk database yang scalable.",
                category="web",
                image_url="https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=300&fit=crop",
                gallery_images=[
                    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop",
                    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop"
                ],
                hover_content="Dibuat dengan React, Node.js, dan MongoDB. Dilengkapi dengan mode gelap/terang, desain responsif, dan animasi yang halus.",
                fun_fact="Proyek ini selesai dalam 3 hari dan menggunakan lebih dari 15 library animasi yang berbeda!",
                tech_stack=["React", "Node.js", "MongoDB", "Tailwind CSS"],
                features=["Mode gelap dan terang", "Animasi interaktif", "Desain responsif"],
                challenges=["Optimasi performa animasi", "Kompatibilitas lintas browser"],
                solutions=["Implementasi lazy loading", "Testing ekstensif"],
                github_url="https://github.com/demo/portfolio",
                demo_url="https://portfolio-demo.com",
                duration="3 hari",
                team_size=1,
                status="selesai"
            ),
            HoverItemCreate(
                title="Aplikasi E-commerce",
                subtitle="Solusi Full-stack",
                description="Pengalaman belanja modern dengan integrasi pembayaran yang lengkap",
                detailed_description="Platform e-commerce yang komprehensif dengan sistem pembayaran terintegrasi, manajemen inventori real-time, dan dashboard admin yang powerful.",
                category="app",
                image_url="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
                gallery_images=[
                    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop"
                ],
                hover_content="Solusi e-commerce lengkap dengan integrasi Stripe, inventori real-time, dan dashboard admin yang powerful.",
                fun_fact="Memproses lebih dari 1000 pesanan per bulan!",
                tech_stack=["Next.js", "PostgreSQL", "Stripe", "Redis"],
                features=["Sistem pembayaran multi-gateway", "Manajemen inventori real-time"],
                challenges=["Integrasi payment gateway yang kompleks"],
                solutions=["Implementasi microservices architecture"],
                github_url="https://github.com/demo/ecommerce",
                demo_url="https://toko-online-demo.com",
                duration="2 bulan",
                team_size=3,
                status="aktif"
            )
        ]
        
        for item_data in sample_items:
            item = HoverItem(user_id=sample_user["id"], **item_data.dict())
            await db.hover_items.insert_one(item.dict())

# Authentication Routes
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    """Register a new user"""
    # Check if email already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user without username (will be set later)
    user = User(
        email=user_data.email,
        username="",  # Will be set in username selection
        password_hash=hash_password(user_data.password),
        full_name=user_data.full_name
    )
    
    await db.users.insert_one(user.dict())
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserProfile(**user.dict()),
        "needs_username": True
    }

@api_router.post("/auth/login")
async def login(user_data: UserLogin):
    """Login user"""
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user["is_active"]:
        raise HTTPException(status_code=401, detail="Account disabled")
    
    # Create access token
    access_token = create_access_token(data={"sub": user["id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserProfile(**user),
        "needs_username": not user["username"]
    }

@api_router.post("/auth/select-username")
async def select_username(
    username_data: UsernameSelect,
    current_user: User = Depends(get_current_user)
):
    """Select username after registration"""
    if not validate_username(username_data.username):
        raise HTTPException(
            status_code=400, 
            detail="Username must be 3-30 characters, alphanumeric and underscore only"
        )
    
    # Check if username already exists
    existing_user = await db.users.find_one({"username": username_data.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Update user with username
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"username": username_data.username, "updated_at": datetime.utcnow()}}
    )
    
    # Get updated user
    updated_user = await db.users.find_one({"id": current_user.id})
    
    return {
        "message": "Username set successfully",
        "user": UserProfile(**updated_user)
    }

@api_router.get("/auth/me")
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return UserProfile(**current_user.dict())

# User Profile Routes
@api_router.get("/users/{username}")
async def get_user_profile(username: str):
    """Get user profile by username"""
    user = await db.users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserProfile(**user)

@api_router.get("/users/{username}/projects")
async def get_user_projects(username: str):
    """Get projects by username"""
    user = await db.users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    projects = await db.hover_items.find({"user_id": user["id"]}).to_list(1000)
    return [HoverItem(**project) for project in projects]

@api_router.put("/users/me")
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update current user profile"""
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": update_data}
    )
    
    updated_user = await db.users.find_one({"id": current_user.id})
    return UserProfile(**updated_user)

# Portfolio Routes (updated with authentication)
@api_router.get("/projects")
async def get_all_projects():
    """Get all public projects"""
    await init_sample_data()
    projects = await db.hover_items.find().to_list(1000)
    return [HoverItem(**project) for project in projects]

@api_router.get("/projects/{project_id}")
async def get_project(project_id: str):
    """Get specific project and increment views"""
    project = await db.hover_items.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Increment views
    await db.hover_items.update_one(
        {"id": project_id},
        {"$inc": {"views": 1}}
    )
    
    project["views"] += 1
    return HoverItem(**project)

@api_router.post("/projects")
async def create_project(
    project_data: HoverItemCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new project"""
    project = HoverItem(user_id=current_user.id, **project_data.dict())
    await db.hover_items.insert_one(project.dict())
    return project

@api_router.put("/projects/{project_id}")
async def update_project(
    project_id: str,
    project_data: HoverItemCreate,
    current_user: User = Depends(get_current_user)
):
    """Update a project"""
    project = await db.hover_items.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this project")
    
    update_data = project_data.dict()
    await db.hover_items.update_one(
        {"id": project_id},
        {"$set": update_data}
    )
    
    updated_project = await db.hover_items.find_one({"id": project_id})
    return HoverItem(**updated_project)

@api_router.delete("/projects/{project_id}")
async def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a project"""
    project = await db.hover_items.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this project")
    
    result = await db.hover_items.delete_one({"id": project_id})
    return {"deleted": result.deleted_count > 0}

# Legacy routes for backward compatibility
@api_router.get("/hover-items")
async def get_hover_items():
    """Legacy route - get all projects"""
    return await get_all_projects()

@api_router.get("/hover-items/{item_id}")
async def get_hover_item(item_id: str):
    """Legacy route - get specific project"""
    return await get_project(item_id)

# Root route
@api_router.get("/")
async def root():
    return {"message": "HoverBoard API dengan Authentication Ready! 🚀"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()