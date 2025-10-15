# Corporate Finance Feature - Setup Guide

## Prerequisites

1. **Node.js 18+** installed
2. **Supabase project** created and running
3. **Git** for version control

## Environment Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project dashboard under Settings > API.

### 3. Database Setup
Run the SQL migration in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** tab
3. Copy the contents of `supabase/complete-migration.sql`
4. Paste and run the migration

This will create all necessary tables, indexes, RLS policies, and sample data.

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Features Available

### 🔐 Authentication
- User registration and login
- Secure session management
- User profile management

### 📊 Model Management
- Create, edit, and delete DCF models
- Model templates and categorization
- Public/private model sharing

### 📈 Scenario Management
- Multiple scenarios per model
- Scenario comparison and analysis
- Drag-and-drop reordering

### 💾 Data Persistence
- Automatic model saving
- Version history and restoration
- Real-time collaboration

### 🔗 Sharing & Collaboration
- Share models with specific users
- Public model discovery
- Granular permission controls

## Usage

### 1. Sign Up/Login
- Click "Sign Up" to create a new account
- Or "Sign In" if you already have an account

### 2. Create Your First Model
- Navigate to "Corporate Finance" section
- Click "New Model" to create a DCF model
- Fill in the model details and parameters

### 3. Add Scenarios
- Select your model
- Click "New Scenario" to create different valuation scenarios
- Configure scenario-specific parameters

### 4. Run DCF Analysis
- Select a scenario to view the DCF calculator
- Adjust parameters and see real-time results
- Compare different scenarios

### 5. Share and Collaborate
- Share models with team members
- Set specific permissions (view, edit, share, delete)
- Discover public models from the community

## Troubleshooting

### Common Issues

**1. Authentication Errors**
- Verify your Supabase URL and anon key are correct
- Check that RLS policies are properly set up
- Ensure user is authenticated before accessing models

**2. Database Connection Issues**
- Verify Supabase project is running
- Check network connectivity
- Review Supabase logs for errors

**3. Permission Denied Errors**
- Ensure RLS policies are active
- Check user authentication status
- Verify model ownership or sharing permissions

### Getting Help

1. Check the browser console for error messages
2. Review Supabase logs in the dashboard
3. Verify environment variables are set correctly
4. Ensure all database migrations have been run

## Next Steps

After setup, you can:

1. **Customize Templates**: Create industry-specific templates
2. **Integrate APIs**: Connect external data sources
3. **Advanced Analytics**: Add more sophisticated analysis tools
4. **Team Collaboration**: Set up team workspaces
5. **API Development**: Build custom integrations

## Security Notes

- All data is protected by Row Level Security (RLS)
- User authentication is required for all operations
- Sharing permissions are granular and secure
- Sensitive data is encrypted in transit and at rest

## Performance Tips

- Use pagination for large model lists
- Enable caching for frequently accessed data
- Optimize queries with proper indexing
- Monitor database performance in Supabase dashboard