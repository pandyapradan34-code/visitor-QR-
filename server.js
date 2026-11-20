const express=require('express');const cors=require('cors');const path=require('path');require('dotenv').config();
const visitorRoutes=require('./backend/routes/visitorRoutes');const photoRoutes=require('./backend/routes/photoRoutes');const slideshowRoutes=require('./backend/routes/slideshowRoutes');
const app=express();app.use(cors());app.use(express.json());app.use(express.urlencoded({extended:true}));app.use(express.static(path.join(__dirname,'frontend')));app.use('/uploads',express.static(path.join(__dirname,'backend/uploads')));
app.get('/',(req,res)=>res.sendFile(path.join(__dirname,'frontend/pages/index.html')));
app.get('/display',(req,res)=>res.sendFile(path.join(__dirname,'frontend/pages/display.html')));
app.get('/admin',(req,res)=>res.sendFile(path.join(__dirname,'frontend/pages/admin.html')));
app.use('/api/visitors',visitorRoutes);app.use('/api/photos',photoRoutes);app.use('/api/slideshow',slideshowRoutes);
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({success:false,message:err.message||'Server error'});});
const PORT=process.env.PORT||3000;app.listen(PORT,()=>console.log(`Visitor Photo Slideshow running at http://localhost:${PORT}`));
