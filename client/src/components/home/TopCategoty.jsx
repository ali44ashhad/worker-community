import React, { useEffect, useState } from "react";
import axios from "axios";
import TopCategoryCard from "./TopCategoryCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
axios.defaults.withCredentials = true;

const TopCategory = () => {
    const [topCategories, setTopCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Service metadata for descriptions and keywords (from SERVICE_RULES)
    const SERVICE_METADATA = {
        "Academics": {
            description: "Tuition and educational support for various subjects and levels.",
            subCategories: ["Home Tuitions", "Tuition Center", "School", "College"],
            keywords: ["Maths", "Science", "Language", "English", "Hindi", "Sanskrit", "Spanish", "French", "German", "Mandarin", "Italian", "Accounts", "Economics", "Physics", "Chemistry"]
        },
        "Music": {
            description: "Lessons and classes for a variety of musical instruments and vocals.",
            subCategories: ["Home Classes", "Academy"],
            keywords: ["Home Classes", "Guitar", "Academy", "Piano", "Drums", "Violin", "Flute", "Vocals", "Singing", "Saxophone"]
        },
        "Dance": {
            description: "Instruction in popular dance styles for all skill levels.",
            subCategories: ["Home Classes", "Academy"],
            keywords: ["Zumba", "Bhangra", "Salsa", "Jiving", "Freestyle", "Breakdance"]
        },
        "Fitness & Sports": {
            description: "Personal training, group classes, and coaching for various fitness activities and sports.",
            subCategories: ["Home Classes", "Academy"],
            keywords: ["Yoga", "Pilates", "Fitness", "Zumba", "Skateboarding", "Skating", "Cricket", "Football", "Pickle Ball", "Badminston", "Tennis", "Table Tennis", "Chess", "Padel", "Gym", "Strength Training", "Core", "Strength", "Weight Training", "Weights", "Sudoku", "Puzzle"]
        },
        "Home Cooking": {
            description: "Home-cooked meals and culinary services delivered to your doorstep.",
            subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
            keywords: ["Food", "Cook", "Italian", "Indian", "Mexican", "Rajasthani", "Gujrati", "Bengali", "Chinese", "Burgers", "Pizza", "Asian", "Sushi", "Dimsums", "Sushi Cake", "Salads", "Ramen", "Pasta", "Biryani"]
        },
        "Home Catering": {
            description: "Catering services for events and gatherings from home-based providers.",
            subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
            keywords: ["Food", "Cook", "Italian", "Indian", "Mexican", "Rajasthani", "Gujrati", "Bengali", "Chinese", "Burgers", "Pizza", "Asian", "Sushi", "Dimsums", "Sushi Cake", "Salads", "Ramen", "Pasta", "Biryani"]
        },
        "Home Baker": {
            description: "Custom baked goods for celebrations, everyday treats, and special dietary needs.",
            subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
            keywords: ["Cakes", "Pastry", "Brownie", "Muffins", "Tarts", "Eggless", "Quiche", "Fondant", "Chocolate", "Protein Bar", "Granola", "Bread"]
        },
        "Catering": {
            description: "Professional catering services for events, parties, and corporate functions.",
            subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
            keywords: ["Food", "Cook", "Italian", "Indian", "Mexican", "Rajasthani", "Gujrati", "Bengali", "Chinese", "Burgers", "Pizza", "Asian", "Sushi", "Dimsums", "Sushi Cake", "Salads", "Ramen", "Pasta", "Biryani"]
        },
        "Professional Baker": {
            description: "Professional bakery services with commercial-grade quality and expertise.",
            subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
            keywords: ["Cakes", "Pastry", "Brownie", "Muffins", "Tarts", "Eggless", "Quiche", "Fondant"]
        },
        "Workshops": {
            description: "Interactive workshops and learning sessions for various skills and hobbies.",
            subCategories: ["Home Workshops", "Online Workshops"],
            keywords: ["Summer", "Winter", "Story Telling", "Book Reading", "Cooking", "Baking", "Workshop"]
        },
        "Photography": {
            description: "Professional photography services for events, portraits, and special occasions.",
            subCategories: ["Academy"],
            keywords: ["Lens", "Camera", "Video", "Wedding", "Birthday"]
        },
        "Technology": {
            description: "Services related to AI, coding, digital marketing, and tech consulting.",
            subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
            keywords: ["AI", "Python", "Automation", "Coding", "Image Creation", "Digital Marketing", "Designing", "Scratch", "Prompt", "Chat GPT", "LLM", "Java", "Clone", "Video Generaion"]
        },
        "Consulting": {
            description: "Expert consulting services for business, finance, and specialized needs.",
            subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
            keywords: ["Financial Planning", "Tax Consultancy", "CA", "Chartered Accountant", "Returns", "Landscaping", "Garden", "Flowers"]
        },
        "Finance": {
            description: "Financial planning, investment advice, and money management services.",
            subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
            keywords: ["Financial Planning", "Tax Planning", "Accounting", "Investments", "Mutual Finds", "Stocks", "Broker", "Money", "Bonds", "Crypto"]
        },
        "Groceries": {
            description: "Fresh groceries, vegetables, fruits, and daily essentials delivered to your home.",
            subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
            keywords: ["Kitchen", "Grocery", "Vegetables", "Fruits", "Sauce", "Milk", "Bread"]
        },
        "Home Products": {
            description: "Handcrafted home products, decor items, and household essentials.",
            subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
            keywords: ["Candles", "Handicrafts", "Bathroom Products", "Artefacts", "Sculptures", "Show Piece", "Garden", "Furniture", "Flooring", "Marble", "Wooden", "Carpenter", "Electrical", "Plumbing", "Solar", "Gate", "Light", "Paint", "Wall"]
        },
        "Apparels & Footwear": {
            description: "Fashionable clothing, footwear, and accessories for all occasions.",
            subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
            keywords: ["Fashion", "Shoes", "Chappals", "Sandals", "Suits", "Shirts", "Kurti", "Indo western", "Coord Sets"]
        },
        "Law": {
            description: "Legal services, consultation, and representation for various legal matters.",
            subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
            keywords: ["Tax", "Civil", "Criminal", "Corporate", "Arbitration", "High Court", "Court", "Supreme Court", "District Court", "Judge", "Lawyer", "Advocate", "Bail"]
        },
        "Medical": {
            description: "Medical services, healthcare consultation, and medical equipment.",
            subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
            keywords: ["Doctor", "Nurse", "Medical Equipment"]
        },
        "Art & Craft": {
            description: "Art classes, craft workshops, and creative learning experiences.",
            subCategories: ["Home Classes", "Academy"],
            keywords: ["Origami", "Painting", "Drawing", "Colouring"]
        },
        "Home Interiors": {
            description: "Interior design services to transform your living spaces.",
            subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
            keywords: ["Interiros", "Designing"]
        },
        "Construction": {
            description: "Construction services, home building, and renovation projects.",
            subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
            keywords: ["House", "Farm House", "Flat", "Floor", "Marble", "Stone", "Wall"]
        },
        "Real Estate": {
            description: "Real estate consultation, property buying, and selling services.",
            subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
            keywords: ["Real Estate Consultant", "Property", "Buy", "Sell"]
        },
        "Event Planner": {
            description: "Complete event planning services for weddings, birthdays, and corporate events.",
            subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
            keywords: ["Birthday", "Decor", "Wedding", "Anniversary", "Balloon", "Props", "Corporate Event", "Rides"]
        },
        "Gifting": {
            description: "Thoughtful gift sets and corporate gifting solutions.",
            subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
            keywords: ["Corporate", "Gift Set"]
        },
        "Other": {
            description: "Various other services and specialized offerings from community providers.",
            subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
            keywords: []
        }
    };

    // Map categories to their images
    const categoryImages = {
        "Academics": "AcademicsCategoryImage.png",
        "Music": "MusicCategoryImage.png",
        "Dance": "DanceCategoryImage.png",
        "Fitness & Sports": "fitnessCategoryImage1.png",
        "Home Baker": "HomeBakerCategoryImage.png",
        "Technology": "TechnologyCategoryImage.png"
    };

    useEffect(() => {
        const fetchTopCategories = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get(`${API_URL}/api/comments/top-categories?limit=6`);
                if (res.data.success && res.data.categories.length > 0) {
                    // Merge with metadata - ensure all required fields are present
                    const categoriesWithMetadata = res.data.categories.map(cat => {
                        const metadata = SERVICE_METADATA[cat.category] || {};
                        return {
                            ...cat,
                            description: metadata.description || '',
                            subCategories: metadata.subCategories || [],
                            keywords: metadata.keywords || [],
                            image: categoryImages[cat.category] || "DefaultCategoryImage"
                        };
                    });
                    setTopCategories(categoriesWithMetadata);
                } else {
                    // Fallback to hardcoded if no data
                    const fallbackCategories = Object.entries(SERVICE_METADATA).slice(0, 6).map(([category, data]) => ({
                        category,
                        ...data,
                        image: categoryImages[category] || "DefaultCategoryImage",
                        averageRating: 0,
                        reviewCount: 0,
                        serviceCount: 0
                    }));
                    setTopCategories(fallbackCategories);
                }
            } catch (error) {
                console.error('Failed to fetch top categories:', error);
                // Fallback to hardcoded if error
                const fallbackCategories = Object.entries(SERVICE_METADATA).slice(0, 6).map(([category, data]) => ({
                    category,
                    ...data,
                    image: categoryImages[category] || "DefaultCategoryImage",
                    averageRating: 0,
                    reviewCount: 0,
                    serviceCount: 0
                }));
                setTopCategories(fallbackCategories);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTopCategories();
    }, []);

    if (isLoading) {
        return (
            <section className="w-full max-w-[1350px] mx-auto px-4 py-16">
                <div className="text-center">
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4'></div>
                    <p className='text-xl font-semibold'>Loading categories...</p>
                </div>
            </section>
        );
    }

    if (topCategories.length === 0) return null;

    return (
        <section className="w-full max-w-[1350px] mx-auto px-4 py-16">
            <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-black text-center mb-3">
                    Top Categories
                </h1>
                <p className="text-gray-600 text-center max-w-2xl mx-auto">
                    Discover the diverse talents within our community! Explore some of the most popular services offered by your skilled neighbors, ready to lend a hand.
                </p>
            </div>
            
            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {topCategories.map((categoryData) => (
                    <TopCategoryCard
                        key={categoryData.category}
                        category={categoryData.category}
                        data={categoryData}
                        image={categoryData.image}
                    />
                ))}
            </div>
        </section>
    );
};

export default TopCategory;
