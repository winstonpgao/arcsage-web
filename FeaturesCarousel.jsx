import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FeaturesCarousel = ({ features }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    console.log('FeaturesCarousel rendered with features:', features);

    if (!features || features.length === 0) {
        return null;
    }

    const totalPages = features.length;

    // Auto-slide
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % totalPages);
        }, 8000); // 8 seconds per slide
        return () => clearInterval(interval);
    }, [totalPages, isPaused]);

    // Placeholder for prevSlide and nextSlide functions, and Chevron icons
    // These would typically be defined or imported elsewhere in a real application.
    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % totalPages);
    };

    const ChevronLeft = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
    const ChevronRight = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;

    const currentFeature = features[currentIndex];
    const { title, subtitle, description, image, imagePosition = 'right', items } = currentFeature;

    return (
        <div
            style={{ position: 'relative', width: '100%', height: '600px', overflow: 'hidden', borderRadius: '24px', background: 'var(--color-surface)', cursor: 'pointer' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onClick={nextSlide}
        >
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '60px' }}
                >
                    {/* Content Side */}
                    <div style={{ flex: 1, paddingRight: '60px', zIndex: 2 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h3 style={{ fontSize: '32px', marginBottom: '16px', background: 'linear-gradient(to right, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {features[currentIndex].title}
                            </h3>
                            <h4 style={{ fontSize: '20px', color: 'var(--color-primary)', marginBottom: '24px' }}>
                                {features[currentIndex].subtitle}
                            </h4>
                            <p style={{ fontSize: '18px', lineHeight: '1.6', color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
                                {features[currentIndex].description}
                            </p>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {features[currentIndex].items.map((item, idx) => (
                                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-primary)' }}>
                                        <div style={{ color: 'var(--color-primary)' }}>{item.icon}</div>
                                        <span>{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>

                    {/* Image Side */}
                    <div style={{ flex: 1, height: '100%', position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to right, var(--color-surface) 0%, transparent 20%)',
                            zIndex: 1
                        }} />
                        <img
                            src={features[currentIndex].image || 'https://placehold.co/600x400?text=No+Image'}
                            alt={features[currentIndex].title}
                            onError={(e) => {
                                console.error(`Failed to load image for feature: ${features[currentIndex].title}`, features[currentIndex].image);
                                e.target.src = 'https://placehold.co/600x400?text=Image+Error';
                            }}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                filter: 'brightness(0.7)'
                            }}
                        />
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    prevSlide();
                }}
                style={{
                    position: 'absolute',
                    left: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    zIndex: 10,
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
                <ChevronLeft size={24} />
            </button>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    nextSlide();
                }}
                style={{
                    position: 'absolute',
                    right: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    zIndex: 10,
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
                <ChevronRight size={24} />
            </button>

            {/* Dots Navigation */}
            <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '12px',
                zIndex: 10
            }}>
                {features.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrentIndex(idx);
                        }}
                        style={{
                            width: '30px',
                            height: '30px',
                            padding: 0,
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        aria-label={`Go to slide ${idx + 1}`}
                    >
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: idx === currentIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
                            transition: 'all 0.3s ease',
                            transform: idx === currentIndex ? 'scale(1.5)' : 'scale(1)'
                        }} />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FeaturesCarousel;
