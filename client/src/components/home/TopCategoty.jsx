import React from "react";
import TopCategoryCard from "./TopCategoryCard";

const TopCategory = () => {
    const SERVICE_RULES = {
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
        "Home Baker": {
            description: "Custom baked goods for celebrations, everyday treats, and special dietary needs.",
            subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
            keywords: ["Cakes", "Pastry", "Brownie", "Muffins", "Tarts", "Eggless", "Quiche", "Fondant", "Chocolate", "Protein Bar", "Granola", "Bread"]
        },
        "Technology": {
            description: "Services related to AI, coding, digital marketing, and tech consulting.",
            subCategories: ["Basic Services", "Premium Services", "Specialized Services"],
            keywords: ["AI", "Python", "Automation", "Coding", "Image Creation", "Digital Marketing", "Designing", "Scratch", "Prompt", "Chat GPT", "LLM", "Java", "Clone", "Video Generaion"]
        }
    };

    // Map categories to their images (placeholder names - replace with actual images)
    const categoryImages = {
        "Academics": "AcademicsCategoryImage.png",
        "Music": "MusicCategoryImage.png",
        "Dance": "DanceCategoryImage.png",
        "Fitness & Sports": "fitnessCategoryImage1.png",
        "Home Baker": "HomeBakerCategoryImage.png",
        "Technology": "TechnologyCategoryImage.png"
    };

    return (
        <section className="w-full max-w-[1350px] mx-auto  px-4 py-16">
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
                {Object.entries(SERVICE_RULES).map(([category, data]) => (
                    <TopCategoryCard
                        key={category}
                        category={category}
                        data={data}
                        image={categoryImages[category] || "DefaultCategoryImage"}
                    />
                ))}
            </div>
        </section>
    );
};

export default TopCategory;
