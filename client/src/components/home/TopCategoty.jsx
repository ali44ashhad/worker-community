    import React from "react";

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

    return (
        <section className="w-full max-w-[1350px] max-h-screen mx-auto px-4 py-16">
        <h1 className="text-4xl font-semibold text-center text-gray-900">
            Top Categories
        </h1>
        <p className="text-md text-gray-500 text-center mt-2 max-w-xl mx-auto">
            Discover the diverse talents within our community! Explore some of the most popular services offered by your skilled neighbors, ready to lend a hand.
        </p>
        
        
        </section>
    );
    };

    export default TopCategory;
