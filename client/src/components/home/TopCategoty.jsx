    import React from "react";

    const TopCategory = () => {
    const categories = [
        {
        title: "Modern Living Space",
        img: "https://images.unsplash.com/photo-1719368472026-dc26f70a9b76?q=80&w=736&auto=format&fit=crop",
        desc: "Elegant interiors designed to blend comfort and contemporary style seamlessly.",
        },
        {
        title: "Artistic Design",
        img: "https://images.unsplash.com/photo-1649265825072-f7dd6942baed?q=80&w=798&auto=format&fit=crop",
        desc: "Creative concepts brought to life through bold colors and innovative shapes.",
        },
        {
        title: "Cozy Interiors",
        img: "https://images.unsplash.com/photo-1555212697-194d092e3b8f?q=80&w=687&auto=format&fit=crop",
        desc: "Warm tones and natural lighting that make every space feel like home.",
        },
        {
        title: "Minimalist Aesthetics",
        img: "https://images.unsplash.com/photo-1729086046027-09979ade13fd?q=80&w=862&auto=format&fit=crop",
        desc: "Clean lines and muted color palettes focused on simplicity and function.",
        },
        {
        title: "Rustic Charm",
        img: "https://images.unsplash.com/photo-1601568494843-772eb04aca5d?q=80&w=687&auto=format&fit=crop",
        desc: "Earthy tones and natural materials celebrating handmade craftsmanship.",
        },
        {
        title: "Urban Lifestyle",
        img: "https://images.unsplash.com/photo-1585687501004-615dfdfde7f1?q=80&w=703&auto=format&fit=crop",
        desc: "Modern city-inspired interiors with smart layouts and premium finishes.",
        },
    ];

    return (
        <section className="w-full max-w-[1350px] max-h-screen mx-auto px-4 py-16">
        <h1 className="text-3xl font-semibold text-center text-gray-900">
            Top Categories
        </h1>
        <p className="text-sm text-gray-500 text-center mt-2 max-w-lg mx-auto">
            A curated showcase of signature interior styles — refined, expressive, and timeless.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mt-12 place-items-center">
            {categories.map((item, index) => (
            <div
                key={index}
                className="bg-white shadow-md rounded-lg hover:shadow-lg transition-all duration-300 overflow-hidden w-full max-w-[380px]"
            >
                <img
                src={item.img}
                alt={item.title}
                className="w-full h-56 object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="p-6 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {item.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed flex-grow">
                    {item.desc}
                </p>
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 mt-4 self-start">
                    Explore Collection →
                </button>
                </div>
            </div>
            ))}
        </div>
        </section>
    );
    };

    export default TopCategory;
