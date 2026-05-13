document.addEventListener('DOMContentLoaded', () => {
    // Swipe Interactions for Mockup
    const swipeBtns = document.querySelectorAll('.btn-swipe');
    const propertyCard = document.querySelector('.property-card');
    
    // Array of fake properties to cycle through
    const properties = [
        { title: 'Piso Moderno, Centro', price: '1.200€ / mes', features: '2 Hab • 1 Baño • Amueblado', isNew: true },
        { title: 'Estudio Luminoso, Gracia', price: '950€ / mes', features: '1 Hab • 1 Baño • Terraza', isNew: false },
        { title: 'Ático Reformado, Retiro', price: '1.500€ / mes', features: '3 Hab • 2 Baños • Vistas', isNew: true }
    ];
    let currentPropIndex = 0;

    swipeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!propertyCard) return;

            const isLike = btn.classList.contains('like');
            
            // Disable buttons temporarily
            swipeBtns.forEach(b => b.disabled = true);
            
            // Animation for swiping
            propertyCard.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease';
            propertyCard.style.transform = `translateX(${isLike ? '120%' : '-120%'}) rotate(${isLike ? '15deg' : '-15deg'})`;
            propertyCard.style.opacity = '0';

            // Reset and update content after animation
            setTimeout(() => {
                // Update content
                currentPropIndex = (currentPropIndex + 1) % properties.length;
                const nextProp = properties[currentPropIndex];
                
                const titleEl = propertyCard.querySelector('h3');
                const priceEl = propertyCard.querySelector('p');
                const featuresEl = propertyCard.querySelector('.features-badge');
                const imgBadge = propertyCard.querySelector('.img-badge');

                if (titleEl) titleEl.textContent = nextProp.title;
                if (priceEl) priceEl.textContent = nextProp.price;
                if (featuresEl) featuresEl.textContent = nextProp.features;
                if (imgBadge) imgBadge.style.display = nextProp.isNew ? 'block' : 'none';

                // Reset position instantly (no transition)
                propertyCard.style.transition = 'none';
                propertyCard.style.transform = 'scale(0.8)';
                
                // Trigger reflow
                void propertyCard.offsetWidth;
                
                // Add pop-in animation
                propertyCard.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.5s ease';
                propertyCard.style.transform = 'scale(1) translateX(0) rotate(0)';
                propertyCard.style.opacity = '1';
                
                // Re-enable buttons
                setTimeout(() => {
                    swipeBtns.forEach(b => b.disabled = false);
                }, 500);

            }, 500);
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Apply initial state and observe elements
    const animatedElements = document.querySelectorAll('.glass, .section-title');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        scrollObserver.observe(el);
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(8, 11, 18, 0.95)';
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
        } else {
            navbar.style.background = 'rgba(8, 11, 18, 0.7)';
            navbar.style.boxShadow = 'none';
        }
    });
});
