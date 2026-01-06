import express from 'express';
import { generateSitemap, generateRobots } from '../controllers/sitemap.controller.js';

const sitemapRouter = express.Router();

// GET route for sitemap.xml
sitemapRouter.get('/sitemap.xml', generateSitemap);

// GET route for robots.txt
sitemapRouter.get('/robots.txt', generateRobots);

export default sitemapRouter;

