// script.js - Magma Clone Inspired

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// 1. Preloader Logic
const preloader = document.querySelector('.preloader');
const counter = document.querySelector('.preloader-counter');

let count = 0;
const interval = setInterval(() => {
    count += Math.floor(Math.random() * 10) + 1;
    if (count > 100) count = 100;
    counter.innerText = count + '%';
    
    if (count === 100) {
        clearInterval(interval);
        gsap.to(preloader, {
            yPercent: -100,
            duration: 1,
            ease: "power4.inOut",
            onComplete: initAnimations // Start animations after load
        });
    }
}, 50);

// 2. Lenis Smooth Scroll Setup
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

// Integrate Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time)=>{
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0, 0);

// Handle Navigation Links for Smooth Scrolling
document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        lenis.scrollTo(targetId, {
            offset: 0,
            duration: 2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
    });
});


// 3. Generative WebGL/Canvas Background (Magma Simulation)
const canvas = document.getElementById('magma-canvas');
const ctx = canvas.getContext('2d');
let width, height;

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Simple fluid noise simulation for background
let phase = 0;
let scrollProgress = 0;

lenis.on('scroll', (e) => {
    // Map scroll progress to canvas animation
    scrollProgress = e.progress; // 0 to 1
});

function drawMagma() {
    ctx.clearRect(0, 0, width, height);
    
    // Create abstract moving shapes that change color/intensity based on scroll
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Base color shifts as you scroll down
    const r = Math.floor(255 * scrollProgress);
    const g = Math.floor(50 * (1 - scrollProgress));
    const b = Math.floor(100 * Math.sin(phase));

    ctx.fillStyle = `rgba(${r}, ${g}, ${Math.abs(b)}, 0.1)`;
    
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const offsetX = Math.sin(phase + i) * 300 * (1 + scrollProgress);
        const offsetY = Math.cos(phase + i * 2) * 200;
        const radius = 200 + Math.sin(phase * 2 + i) * 100 + (scrollProgress * 200);
        
        ctx.arc(centerX + offsetX, centerY + offsetY, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add subtle grid overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for(let i=0; i<width; i+=50) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    }
    for(let j=0; j<height; j+=50) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(width, j); ctx.stroke();
    }

    phase += 0.005 + (scrollProgress * 0.02); // Speeds up on scroll
    requestAnimationFrame(drawMagma);
}
drawMagma();

// 4. GSAP ScrollTrigger Animations
function initAnimations() {
    
    // Hero Entrance
    gsap.from(".text-line", {
        yPercent: 100,
        opacity: 0,
        stagger: 0.1,
        duration: 1.5,
        ease: "power4.out"
    });

    // Pinning the Hero Section slightly before moving to next
    ScrollTrigger.create({
        trigger: ".hero-pin",
        start: "top top",
        end: "+=50%",
        pin: true,
        pinSpacing: false
    });

    // Sequential Skills Appearance
    const skillsTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".sticky-text-wrapper",
            start: "center center",
            end: "+=300%",
            scrub: 1,
            pin: true
        }
    });

    const skillItems = gsap.utils.toArray('.skill-item');
    
    skillItems.forEach((item, index) => {
        skillsTl.to(item, {
            y: 0,
            opacity: 1,
            color: "#ffffff",
            webkitTextStroke: "0px",
            scale: 1.2,
            duration: 1
        });
        
        // Don't fade out the last item immediately
        if (index !== skillItems.length - 1) {
            skillsTl.to(item, {
                y: -50,
                opacity: 0,
                scale: 1.5,
                duration: 1
            }, "+=0.2");
        } else {
            skillsTl.to(item, {
                scale: 1.5,
                duration: 1
            }, "+=0.5");
        }
    });

    // Horizontal Scroll Gallery
    const horizontalSection = document.querySelector('.horizontal-scroll-section');
    const horizontalContainer = document.querySelector('.horizontal-container');
    
    function getScrollAmount() {
        let containerWidth = horizontalContainer.scrollWidth;
        return -(containerWidth - window.innerWidth);
    }

    const tween = gsap.to(horizontalContainer, {
        x: getScrollAmount,
        duration: 3,
        ease: "none"
    });

    ScrollTrigger.create({
        trigger: horizontalSection,
        start: "top top",
        end: () => `+=${getScrollAmount() * -1}`,
        pin: true,
        animation: tween,
        scrub: 1,
        invalidateOnRefresh: true
    });



    // Experience Section Timeline
    const expTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: ".experience-section",
            start: "top 60%",
            end: "bottom 80%",
            scrub: 1
        }
    });

    expTimeline.to(".timeline-progress", {
        height: "100%",
        ease: "none"
    });

    const timelineItems = gsap.utils.toArray('.timeline-item');
    
    timelineItems.forEach((item, index) => {
        const card = item.querySelector('.exp-card-inner');
        const node = item.querySelector('.timeline-node');
        
        // Node activate
        gsap.to(node, {
            scrollTrigger: {
                trigger: item,
                start: "top 60%",
                end: "bottom center",
                toggleClass: "active"
            }
        });

        // Card reveal
        gsap.from(card, {
            scrollTrigger: {
                trigger: item,
                start: "top 85%",
                end: "top 50%",
                scrub: 1,
            },
            x: 100,
            opacity: 0,
            rotationY: -10,
            scale: 0.95,
            duration: 1.5,
            ease: "power4.out"
        });
    });

    // Text Reveal Section (White background)
    gsap.to(".text-reveal-section", {
        scrollTrigger: {
            trigger: ".text-reveal-section",
            start: "top bottom",
            end: "top top",
            scrub: true
        },
        backgroundColor: "#ffffff",
        color: "#000000"
    });

    gsap.to(".reveal-text", {
        scrollTrigger: {
            trigger: ".text-reveal-section",
            start: "top center",
            end: "center center",
            scrub: 1
        },
        y: 0,
        opacity: 1
    });

    gsap.to(".reveal-subtext", {
        scrollTrigger: {
            trigger: ".text-reveal-section",
            start: "top 30%",
            end: "center 40%",
            scrub: 1
        },
        y: 0,
        opacity: 1
    });

    // Make body white when passing text reveal section to contrast footer reveal
    ScrollTrigger.create({
        trigger: ".text-reveal-section",
        start: "top top",
        end: "bottom top",
        onEnter: () => gsap.to("body", { backgroundColor: "#ffffff" }),
        onLeaveBack: () => gsap.to("body", { backgroundColor: "#000000" }),
    });

    // Footer Reveal Effect
    gsap.set(".magma-footer", { yPercent: -50 });
    gsap.to(".magma-footer", {
        yPercent: 0,
        ease: "none",
        scrollTrigger: {
            trigger: ".text-reveal-section",
            start: "bottom bottom",
            end: "bottom top",
            scrub: true
        }
    });
}

// 5. AJAX Form Submission & Custom Popup
const contactForm = document.querySelector('.premium-form');
const submitBtn = document.querySelector('.premium-submit .text');
const successPopup = document.querySelector('.success-popup');
const closePopup = document.querySelector('.popup-close');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent redirect
        
        // Change button text to indicate loading
        const originalText = submitBtn.innerText;
        submitBtn.innerText = "SENDING...";
        
        const formData = new FormData(contactForm);
        
        fetch("https://formsubmit.co/ajax/muhammadtalhabinkhalid@gmail.com", {
            method: "POST",
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            // Reset form
            contactForm.reset();
            submitBtn.innerText = originalText;
            
            // Show Success Popup
            successPopup.classList.add('active');
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            submitBtn.innerText = "ERROR - TRY AGAIN";
            setTimeout(() => submitBtn.innerText = originalText, 3000);
        });
    });
}

if (closePopup) {
    closePopup.addEventListener('click', () => {
        successPopup.classList.remove('active');
    });
}

// 6. Custom Cursor & Magnetic Effects
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (cursorDot && cursorOutline && window.matchMedia("(pointer: fine)").matches) {
    gsap.set(cursorDot, { xPercent: -50, yPercent: -50 });
    gsap.set(cursorOutline, { xPercent: -50, yPercent: -50 });

    let xTo = gsap.quickTo(cursorOutline, "x", {duration: 0.4, ease: "power3"});
    let yTo = gsap.quickTo(cursorOutline, "y", {duration: 0.4, ease: "power3"});
    let xToDot = gsap.quickTo(cursorDot, "x", {duration: 0.1, ease: "power3"});
    let yToDot = gsap.quickTo(cursorDot, "y", {duration: 0.1, ease: "power3"});

    window.addEventListener("mousemove", e => {
        xTo(e.clientX);
        yTo(e.clientY);
        xToDot(e.clientX);
        yToDot(e.clientY);
    });

    const interactables = document.querySelectorAll('a, button, .exp-card-inner, .horizontal-item, input, textarea');
    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            gsap.to(cursorOutline, { scale: 2, backgroundColor: "rgba(255,255,255,0.1)", duration: 0.3 });
            gsap.to(cursorDot, { scale: 0, duration: 0.3 });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(cursorOutline, { scale: 1, backgroundColor: "transparent", duration: 0.3 });
            gsap.to(cursorDot, { scale: 1, duration: 0.3 });
        });
    });
}

// Magnetic Buttons
const magnetics = document.querySelectorAll('.magnetic-link, .premium-submit');
magnetics.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const h = rect.width / 2;
        const v = rect.height / 2;
        const x = e.clientX - rect.left - h;
        const y = e.clientY - rect.top - v;

        gsap.to(btn, {
            x: x * 0.4,
            y: y * 0.4,
            duration: 0.4,
            ease: "power3.out"
        });
    });

    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.7,
            ease: "elastic.out(1, 0.3)"
        });
    });
});
