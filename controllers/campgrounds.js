const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const cloudinary = require('cloudinary').v2;
const { OpenAI } = require('openai');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
};

module.exports.renderNewForm  = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({ 
        query:req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.image =  req.files.map(f => ({ url: f.path, filename: f.filename}));
    campground.author= req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success',"Successfully made a new Campground!!");
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    console.log(campground);
    if(!campground){
        req.flash('error',"Cannot find the Campground!!");
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
};

module.exports.renderEditForm =async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    // If not any campground present
    if(!campground){
        req.flash('error','You do not have permission to do that'); 
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
};

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);     
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename}));
    campground.image.push(...imgs);
    await campground.save();
    if (req.body.deleteImages){
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({ $pull: { image: {filename: { $in : req.body.deleteImages }}}})
        console.log(campground)
    }
    req.flash('success',"Successfully Updated Campground!!");
    res.redirect(`/campgrounds/${campground._id}`);
};  

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success',"Successfully Deleted Campground!!");
    res.redirect('/campgrounds');
};

module.exports.generateDescription = async (req, res) => {
    const { title, location } = req.body;
    if (!title || !location) {
        return res.status(400).json({ error: 'Title and location are required to generate a description.' });
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: 'You are a travel copywriter for an outdoor camping platform. Write vivid, honest, and inviting campground descriptions in 2-3 sentences. Focus on the natural setting, atmosphere, and what makes the spot special. Avoid generic filler phrases like "nestled" or "breathtaking". Write as if you have visited the place.',
            },
            {
                role: 'user',
                content: `Write a campground description for "${title}" located in "${location}".`,
            },
        ],
        max_tokens: 150,
        temperature: 0.75,
    });
    res.json({ description: completion.choices[0].message.content.trim() });
};