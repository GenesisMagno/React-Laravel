import { useState, useEffect } from 'react';

export default function About() {
const [activeSection, setActiveSection] = useState('story');

  const menuItems = [
    { id: 'story', label: 'Our Story' },
    { id: 'offerings', label: 'What We Offer' },
    { id: 'commitment', label: 'Our Commitment' },
    { id: 'location', label: 'Service Area' },
  ];

  return (
    <div className="max-w-4/5 mx-auto px-4 font-sans">
      {/* Header */}
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold text-green-700 mb-2">Better Taste</h1>
        <p className="text-lg text-gray-600">Homemade Goodness from Our Family to Yours</p>
      </header>

      {/* Navigation Pills */}
      <div className="flex flex-wrap justify-center mb-8 gap-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeSection === item.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveSection(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Content - Conditional Rendering */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {activeSection === 'story' && (
          <div className="story-section">
            <h2 className="text-2xl font-bold text-green-700 mb-4">Our Story</h2>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="md:w-2/3">
                <p className="mb-4">
                  Our journey began in our family kitchen, where recipes were perfected and dreams were shared. With determination and love for good food, we decided to share our creations with our neighbors and friends throughout Cavite.
                </p>
                <p>
                  Today, we continue that tradition, preparing each item with the same care and attention to detail as we did on day one, bringing joy to our community through fresh, flavorful offerings.
                </p>
              </div>
              <div className="md:w-1/3">
                <img
                  src="/images/noimage.png"
                  alt="Family cooking together"
                  className="rounded-lg shadow-md w-full h-60"
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'offerings' && (
          <div className="offerings-section">
            <h2 className="text-2xl font-bold text-green-700 mb-4">What We Offer</h2>
            <p className="mb-6">We specialize in a variety of freshly made foods that have become favorites in the Cavite area.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Fresh Salads',
                  description: 'Vibrant, crisp salads using locally sourced ingredients.',
                  image: 'http://localhost:8000/images/veggiessalad.jpg'
                },
                {
                  title: 'Delightful Jellies',
                  description: 'Colorful and flavorful jellies made with natural ingredients.',
                  image: 'http://localhost:8000/images/mangojelly.jpg'
                },
                {
                  title: 'Graham Desserts',
                  description: 'Homemade graham desserts that have become customer favorites.',
                  image: 'http://localhost:8000/images/mangograhams.jpg'
                }
              ].map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm">
                  <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-green-600 mb-2">{item.title}</h3>
                    <p className="text-gray-700">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'commitment' && (
          <div className="commitment-section">
            <h2 className="text-2xl font-bold text-green-700 mb-4">Our Commitment to You</h2>
            <p className="mb-6">As a family business, we believe in treating every customer like a member of our extended family.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              {[
                {
                  icon: '❤️',
                  title: 'Made with Love',
                  description: 'Each item is prepared with care, using time-honored family recipes.'
                },
                {
                  icon: '🌱',
                  title: 'Quality Ingredients',
                  description: 'We select the freshest ingredients to ensure delicious and healthy offerings.'
                },
                {
                  icon: '🏠',
                  title: 'Local Service',
                  description: 'Proudly serving the Cavite area to maintain freshness and prompt delivery.'
                }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <h3 className="font-bold text-lg text-green-600 mb-2">{item.title}</h3>
                  <p className="text-gray-700">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'location' && (
          <div className="location-section">
            <h2 className="text-2xl font-bold text-green-700 mb-4">Proudly Serving Cavite</h2>
            <p className="mb-6">Our delivery service is exclusively available in the Cavite area, allowing us to maintain freshness and provide prompt delivery.</p>
            
            <div className="relative bg-gray-200 rounded-lg overflow-hidden h-70 flex items-center justify-center w-full">
              <img src="/images/map.png" alt="Cavite map" className="w-full h-full object-fill absolute" />
              <p className="bg-green-600 bg-opacity-75 text-white px-4 py-2 rounded z-10 font-bold">Cavite Delivery Area</p>
            </div>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-green-600 text-white rounded-lg shadow-md p-6 text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Ready to Order?</h2>
        <p className="mb-4">We've created a simple ordering system to make it easy for you to enjoy our homemade specialties.</p>
        <button className="bg-white text-green-500 font-bold py-2 px-6 rounded-full hover:bg-gray-100 transition-colors">
          Order Now
        </button>
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-600 mt-12">
        <p className="font-bold text-lg text-green-700 mb-2">Bettertaste</p>
        <p className="mb-4">Bringing homemade goodness to Cavite since 2023</p>
        <div className="flex justify-center gap-4 mb-4">
          <a href="#" className="text-xl">📱</a>
          <a href="#" className="text-xl">📘</a>
          <a href="#" className="text-xl">📸</a>
        </div>
        <p className="text-sm">© 2025 Family Delights. All rights reserved.</p>
      </footer>
    </div>
  );
};


