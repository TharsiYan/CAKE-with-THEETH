# Cake with THEETH

A professional, lightweight cake-selling web application for small businesses.

## Features

### Public Features
- **View Cakes**: Browse the cake gallery without login
- **Like Cakes**: Show appreciation for cakes you love
- **Comment**: Share your thoughts on cakes
- **Rate**: Give ratings (1-5 stars) to cakes
- **Order via WhatsApp**: One-click order button opens WhatsApp with prefilled cake details

### Admin Features
- **Secure Login**: Simple username/password authentication
- **Change Credentials**: Update username and password
- **Cake Management**: Add, edit, delete cakes
- **Image/Video Upload**: Upload multiple images and optional videos for each cake
- **Shop Settings**: Update shop name, phone number, and address
- **Dashboard**: View statistics (total cakes, likes, comments, ratings)

## Cake Fields
- Cake ID (auto-generated)
- Name
- Weight
- Price or price range
- Type
- Selling type: Returnable or Permanent Sale
- Images (multiple)
- Optional video
- Description
- Availability status

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS
- shadcn/ui components
- React Router DOM

### Backend
- Node.js + Express
- SQLite (lightweight, file-based database)
- JWT authentication
- Multer (file uploads)
- bcryptjs (password hashing)

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Quick Start

1. **Install dependencies**:
```bash
npm install
```

2. **Build the frontend**:
```bash
npm run build
```

3. **Start the application**:
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3001
- API: http://localhost:3001/api

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

**Important**: Change the default credentials after first login!

## Project Structure

```
├── dist/                  # Built frontend files
├── server/
│   ├── database/
│   │   ├── schema.sql     # Database schema
│   │   ├── db.js          # Database connection
│   │   └── cake_shop.db   # SQLite database (created on first run)
│   ├── uploads/
│   │   ├── images/        # Uploaded cake images
│   │   └── videos/        # Uploaded cake videos
│   └── server.js          # Express API server
├── src/
│   ├── components/        # React components
│   ├── context/           # React context (Auth, Shop)
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   └── App.tsx            # Main app component
├── start.js               # Startup script
└── package.json
```

## Database Schema

### Tables
1. **shop_settings** - Shop information (name, phone, address)
2. **admin** - Admin credentials (username, hashed password)
3. **cakes** - Cake details (name, weight, price, type, images, etc.)
4. **comments** - User comments on cakes
5. **ratings** - User ratings (1-5 stars) with IP-based uniqueness

## API Endpoints

### Public Endpoints
- `GET /api/shop` - Get shop settings
- `GET /api/cakes` - Get all available cakes
- `GET /api/cakes/:id` - Get single cake with comments
- `POST /api/cakes/:id/like` - Like a cake
- `POST /api/cakes/:id/comments` - Add comment
- `POST /api/cakes/:id/rate` - Rate a cake

### Admin Endpoints (require authentication)
- `POST /api/admin/login` - Admin login
- `PUT /api/admin/credentials` - Change credentials
- `PUT /api/shop` - Update shop settings
- `GET /api/admin/cakes` - Get all cakes (including unavailable)
- `POST /api/admin/cakes` - Create new cake
- `PUT /api/admin/cakes/:id` - Update cake
- `DELETE /api/admin/cakes/:id` - Delete cake
- `DELETE /api/admin/cakes/:id/images` - Delete image
- `DELETE /api/admin/cakes/:id/video` - Delete video
- `DELETE /api/admin/comments/:id` - Delete comment

## Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=3001
JWT_SECRET=your-secret-key-here
```

## Deployment

### Production Build

1. Build the frontend:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

The server will serve the built frontend files and handle API requests.

### Important Notes

- The SQLite database is stored in `server/database/cake_shop.db`
- Uploaded files are stored in `server/uploads/`
- Make sure to backup these directories for data persistence
- Change the default JWT_SECRET in production

## Customization

### Shop Details
Update shop name, phone, and address in the Admin Settings page.

### Styling
The app uses Tailwind CSS with a custom color palette:
- Background: `#F6F6F2` (warm off-white)
- Text: `#111111` (near-black)
- Accent: `#B9FF2C` (neon lime)
- Secondary text: `#6D6D6D`

## License

MIT License - feel free to use for your own cake shop!

---

Made with ❤️ for Cake with THEETH, Nedunkerny
