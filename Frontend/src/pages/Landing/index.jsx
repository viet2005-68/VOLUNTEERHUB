import React, { useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";
import leaf1 from "../../assets/img/leaf-1.png";
import leaf2 from "../../assets/img/leaf-2.png";
import leaf3 from "../../assets/img/leaf-3.png";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import { landing1 } from "../../assets/img/index";
import { MdOutlineDateRange } from "react-icons/md";
import { FaPeopleGroup } from "react-icons/fa6";
import { FaClock, FaArrowRight } from "react-icons/fa";
import { AiOutlineFileDone } from "react-icons/ai";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { voluteerTree, futureVolunteer } from "../../assets/img/index";
import { LOGIN_LINK } from "../../constant/constNavigate";
function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState("home");
    const aboutRef = useRef(null);
    const statsRef = useRef(null);
    const navigate = useNavigate();
    const naviageLogin = () => {
        window.location.href = LOGIN_LINK;
    };

    // Handle scroll for navbar styling
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);

            // Update active section based on scroll position
            const sections = ["home", "about", "review"];
            const current = sections.find((section) => {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    return rect.top <= 100 && rect.bottom >= 100;
                }
                return false;
            });
            if (current) setActiveSection(current);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Smooth scroll function
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            setMenuOpen(false);
        }
    };

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        // About section context
        const ctxAbout = gsap.context(() => {
            const rows = gsap.utils.toArray(".about-row");
            rows.forEach((row, index) => {
                const imgEl = row.querySelector(".about-img");
                const textEl = row.querySelector(".about-text");
                const fromXImg = index % 2 === 0 ? -60 : 60;
                const fromXText = -fromXImg;

                if (imgEl) {
                    gsap.from(imgEl, {
                        x: fromXImg,
                        opacity: 0,
                        scale: 0.98,
                        duration: 0.9,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: row,
                            start: "top 80%",
                            toggleActions: "play none none reverse",
                        },
                    });

                    // Shoot the image out when the row has been scrolled past
                    ScrollTrigger.create({
                        trigger: row,
                        start: "bottom 10%",
                        onLeave: () => {
                            gsap.to(imgEl, {
                                xPercent: fromXImg < 0 ? -140 : 140,
                                rotation: fromXImg < 0 ? -8 : 8,
                                opacity: 0,
                                scale: 0.9,
                                duration: 0.6,
                                ease: "power2.in",
                            });
                        },
                        onEnterBack: () => {
                            gsap.to(imgEl, {
                                xPercent: 0,
                                x: 0,
                                rotation: 0,
                                opacity: 1,
                                scale: 1,
                                duration: 0.4,
                                ease: "power2.out",
                            });
                        },
                    });
                }

                if (textEl) {
                    gsap.from(textEl, {
                        x: fromXText,
                        opacity: 0,
                        duration: 2,
                        ease: "power2.out",
                        delay: 0.1,
                        scrollTrigger: {
                            trigger: row,
                            start: "top 80%",
                            toggleActions: "play none none reverse",
                        },
                    });

                    const textChildren = Array.from(textEl.children || []);
                    if (textChildren.length) {
                        gsap.from(textChildren, {
                            y: 16,
                            opacity: 0,
                            duration: 0.6,
                            stagger: 0.08,
                            ease: "power2.out",
                            scrollTrigger: {
                                trigger: row,
                                start: "top 78%",
                                toggleActions: "play none none reverse",
                            },
                        });
                    }
                }
            });
        }, aboutRef);

        // Stats section context
        const ctxStats = gsap.context(() => {
            const statCards = gsap.utils.toArray(".stat-card");
            if (!statCards.length) return;

            // Ensure any old inline styles are cleared
            gsap.set(statCards, { clearProps: "opacity,visibility,transform" });

            statCards.forEach((card, index) => {
                const numEl = card.querySelector(".stat-number");
                const target = numEl
                    ? parseInt(numEl.getAttribute("data-value") || "0", 10)
                    : 0;

                const counter = { value: 0 };
                const tl = gsap.timeline({ delay: index * 0.12 });
                tl.fromTo(
                    card,
                    { autoAlpha: 0, y: 24 },
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 1,
                        ease: "back.inOut",

                        onComplete: () =>
                            gsap.set(card, { clearProps: "opacity,visibility,transform" }),
                    }
                );

                if (numEl) {
                    tl.fromTo(
                        counter,
                        { value: 0 },
                        {
                            value: target,
                            duration: 0.6,
                            ease: "power1.out",

                            onUpdate: () => {
                                numEl.textContent = Math.floor(counter.value).toLocaleString();
                            },
                        },
                        "<+0.1"
                    );
                }
            });
        }, statsRef);

        return () => {
            ctxAbout.revert();
            ctxStats.revert();
        };
    }, []);
    const dataLading = [
        {
            title: "Events",
            icon: <MdOutlineDateRange />,
            content: "200",
        },
        {
            title: "Active Volunteers",
            icon: <FaPeopleGroup />,
            content: "2000",
        },
        {
            title: "Hours Contributed",
            icon: <FaClock />,
            content: "50000",
        },
        {
            title: "Events Completed",
            icon: <AiOutlineFileDone />,
            content: "100",
        },
    ];
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const navItems = [
        { id: "home", label: "Home" },
        { id: "about", label: "About" },
        { id: "review", label: "Reviews" },
    ];

    return (
        <div className="bg-white">
            {/* Enhanced Navbar with brand colors */}
            <header
                className={`fixed w-full top-0 left-0 z-50 transition-all duration-300 ${scrolled
                    ? "bg-white/95 backdrop-blur-md shadow-lg"
                    : "bg-white/80 backdrop-blur-sm shadow-sm"
                    }`}
            >
                <nav className="max-w-screen-xl mx-auto flex items-center justify-between h-16 sm:h-20 px-6 sm:px-16">
                    {/* Brand Logo with gradient */}
                    <div
                        className="font-lobster text-2xl sm:text-[32px] cursor-pointer group"
                        onClick={() => scrollToSection("home")}
                    >
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105 inline-block">
                            VolunteerHub
                        </span>
                    </div>

                    {/* Desktop & Mobile Navigation */}
                    <div
                        className={`absolute top-0 min-h-[80vh] w-full backdrop-blur-lg flex items-center justify-center duration-500 overflow-hidden lg:static lg:min-h-fit lg:bg-transparent lg:w-auto ${menuOpen
                            ? "left-0 opacity-100"
                            : "left-[-100%] opacity-0 lg:opacity-100"
                            }`}
                    >
                        <ul className="flex flex-col items-center gap-8 lg:flex-row text-black">
                            {navItems.map((item) => (
                                <li key={item.id}>
                                    <button
                                        onClick={() => scrollToSection(item.id)}
                                        className={`nav-link relative group transition-all duration-300 ${activeSection === item.id
                                            ? "text-purple-600 font-bold"
                                            : "text-gray-700 hover:text-purple-600"
                                            }`}
                                    >
                                        {item.label}
                                        <span
                                            className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 transition-all duration-300 ${activeSection === item.id
                                                ? "w-full"
                                                : "w-0 group-hover:w-full"
                                                }`}
                                        />
                                    </button>
                                </li>
                            ))}
                            <li>
                                <button
                                    onClick={() => naviageLogin()}
                                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                                >
                                    Get Started
                                </button>
                            </li>
                        </ul>

                        {/* Decorative elements for mobile menu */}
                        <div className="absolute bottom-0 -right-10 opacity-40 lg:hidden animate-movingY">
                            <img src={leaf1} alt="leaf-1" className="w-32" />
                        </div>
                        <div className="absolute -top-5 -left-5 rotate-90 opacity-40 lg:hidden animate-rotating">
                            <img src={leaf2} alt="leaf-2" className="w-32" />
                        </div>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="flex items-center gap-4 lg:hidden">
                        <button
                            onClick={() => naviageLogin()}
                            className="px-4 py-1.5 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-white text-sm rounded-full font-semibold"
                        >
                            Login
                        </button>
                        <div
                            onClick={toggleMenu}
                            className={`text-xl sm:text-3xl cursor-pointer z-50 transition-all duration-300 ${menuOpen
                                ? "rotate-180 text-purple-600"
                                : "rotate-0 text-gray-700"
                                }`}
                        >
                            <i className={menuOpen ? "ri-close-line" : "ri-menu-4-line"}></i>
                        </div>
                    </div>
                </nav>
            </header>
            <div className="mt-20">
                {/* Hero Section with enhanced brand styling */}
                <section
                    id="home"
                    className="pt-20 pb-10 px-6 sm:px-16 relative overflow-hidden"
                >
                    {/* Background gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-purple-50/20 to-pink-50/30 -z-10" />

                    <div className="container max-w-screen-xl mx-auto">
                        <div className="flex flex-col items-center gap-8 lg:flex-row">
                            {/* Left Content */}
                            <div className="w-full space-y-6 lg:w-1/2 animate-fade-in">
                                {/* Badge with gradient */}
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 border-2 border-purple-300 rounded-full px-4 py-2 animate-pulse">
                                    <span className="text-purple-700 text-sm font-semibold">
                                        #TheSpiritofVolunteering
                                    </span>
                                </div>

                                {/* Main Heading with gradient */}
                                <h1 className="text-black max-sm:!text-3xl leading-tight">
                                    The Spirit of{" "}
                                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_200%]">
                                        Volunteering
                                    </span>
                                </h1>

                                {/* Description */}
                                <p className="text-gray-700 text-lg leading-relaxed max-w-xl">
                                    Connect passionate hearts with meaningful volunteer
                                    activities. Together, we can create positive change for
                                    communities and society.
                                </p>

                                {/* CTA Buttons with enhanced styling */}
                                <div className="flex flex-col gap-3 sm:flex-row md:gap-4 lg:pt-5">
                                    <button
                                        onClick={() => {
                                            naviageLogin();
                                        }}
                                        className="group px-6 py-3.5 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        <span>Get Started</span>
                                        <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button
                                        onClick={() => scrollToSection("about")}
                                        className="group px-6 py-3.5 bg-white border-2 border-purple-400 text-purple-500 rounded-xl font-bold hover:bg-gradient-to-r hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 hover:text-white hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        <span>Explore More</span>
                                        <i className="ri-arrow-down-line group-hover:animate-bounce"></i>
                                    </button>
                                </div>

                                {/* Social Media Links with brand colors */}
                                <div className="flex items-center gap-4 lg:pt-6">
                                    <span className="text-gray-600 text-sm font-medium">
                                        Follow us:
                                    </span>
                                    <div className="flex gap-3">
                                        {[
                                            {
                                                icon: "ri-facebook-fill",
                                                color: "hover:text-indigo-600",
                                            },
                                            {
                                                icon: "ri-instagram-fill",
                                                color: "hover:text-pink-600",
                                            },
                                            {
                                                icon: "ri-twitter-fill",
                                                color: "hover:text-purple-600",
                                            },
                                            { icon: "ri-youtube-fill", color: "hover:text-red-600" },
                                        ].map((social, idx) => (
                                            <button
                                                key={idx}
                                                className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 ${social.color} hover:shadow-md hover:scale-110 transition-all duration-300`}
                                            >
                                                <i className={`${social.icon} text-xl`}></i>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Image with enhanced effects */}
                            <div className="w-full relative lg:w-1/2 mt-8 lg:mt-0">
                                <div className="relative group">
                                    <img
                                        src={landing1}
                                        alt="Volunteering community"
                                        className="w-full h-full object-cover rounded-3xl shadow-2xl group-hover:scale-[1.02] transition-transform duration-500"
                                    />
                                    {/* Gradient overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 rounded-3xl transition-all duration-500" />
                                </div>

                                {/* Floating decorative elements with brand colors */}
                                <div className="absolute -top-6 right-4 opacity-40 animate-movingY">
                                    <i className="ri-leaf-line text-6xl text-purple-500"></i>
                                </div>
                                <div className="absolute bottom-4 left-4 opacity-40 animate-rotating">
                                    <i className="ri-flower-line text-6xl text-pink-500"></i>
                                </div>
                                <div className="hidden lg:block absolute -top-6 -left-6 opacity-40 animate-scaleUp">
                                    <i className="ri-plant-line text-6xl text-indigo-500"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Stats Section with enhanced brand styling */}
                <div className="relative py-16 overflow-hidden" ref={statsRef}>
                    {/* Background with gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" />

                    <div className="container mx-auto px-6 sm:px-10 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {dataLading.map((item, index) => {
                                const gradients = [
                                    "from-indigo-300 to-indigo-400",
                                    "from-purple-300 to-purple-400",
                                    "from-pink-300 to-pink-400",
                                    "from-indigo-300 via-purple-300 to-pink-300",
                                ];

                                return (
                                    <div
                                        key={index}
                                        className="group stat-card bg-white rounded-2xl p-6 cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-gray-100 hover:border-transparent relative overflow-hidden"
                                    >
                                        {/* Gradient overlay on hover */}
                                        <div
                                            className={`absolute inset-0 bg-gradient-to-br ${gradients[index]} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                                        />

                                        <div className="relative z-10 flex flex-col items-center space-y-4">
                                            {/* Icon with gradient background */}
                                            <div
                                                className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradients[index]} flex items-center justify-center text-white text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                                            >
                                                {item.icon}
                                            </div>

                                            {/* Title */}
                                            <p className="text-base font-semibold text-gray-600 text-center">
                                                {item.title}
                                            </p>

                                            {/* Number with gradient text */}
                                            <p
                                                className={`font-lobster text-4xl font-bold bg-gradient-to-r ${gradients[index]} bg-clip-text text-transparent stat-number`}
                                                data-value={item.content}
                                            >
                                                {item.content}
                                            </p>
                                        </div>

                                        {/* Decorative corner element */}
                                        <div
                                            className={`absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br ${gradients[index]} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500`}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* About Section with enhanced brand styling */}
                <section
                    id="about"
                    className="relative overflow-hidden py-20 px-6"
                    ref={aboutRef}
                >
                    {/* Background elements */}
                    <div className="absolute -top-8 -right-12 opacity-20 animate-movingY">
                        <img
                            src={leaf3}
                            alt="decorative leaf"
                            className="w-40 md:w-60 lg:w-80"
                        />
                    </div>

                    {/* Section Header */}
                    <div className="flex flex-col items-center justify-center gap-4 text-center mb-16">
                        <h2 className="font-lobster text-5xl">
                            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                About Us
                            </span>
                        </h2>
                        <p className="text-gray-600 max-w-2xl text-lg">
                            Discover how we're making a difference in communities worldwide
                        </p>
                        <div className="w-24 h-1 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 rounded-full" />
                    </div>

                    <div className="container space-y-20 mx-auto max-w-7xl">
                        {/* First Row */}
                        <div className="flex flex-col items-center gap-10 lg:flex-row about-row">
                            <div className="w-full lg:w-1/2 group">
                                <div className="relative">
                                    <img
                                        src={voluteerTree}
                                        alt="Empowering Communities"
                                        className="w-full sm:w-2/3 lg:w-full xl:w-2/3 mx-auto rounded-3xl shadow-xl skew-y-2 about-img group-hover:skew-y-0 transition-all duration-500"
                                    />
                                    {/* Gradient overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20 rounded-3xl transition-all duration-500 w-full sm:w-2/3 lg:w-full xl:w-2/3 mx-auto" />
                                </div>
                            </div>

                            <div className="w-full lg:w-1/2 about-text">
                                <div className="space-y-6 px-4">
                                    {/* Icon badge */}
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full">
                                        <span className="text-2xl">🌍</span>
                                        <span className="text-purple-700 font-semibold text-sm">
                                            Our Mission
                                        </span>
                                    </div>

                                    <h3 className="text-gray-800">
                                        Empowering{" "}
                                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-lobster">
                                            Communities
                                        </span>
                                    </h3>

                                    <p className="text-gray-700 text-lg leading-relaxed">
                                        VolunteerHub is a community platform that connects
                                        passionate individuals with meaningful volunteer
                                        opportunities. We believe that every small action creates a
                                        ripple of change — whether it's planting trees, supporting
                                        local causes, or organizing impactful events.
                                    </p>

                                    {/* Feature list */}
                                    <ul className="space-y-3 pt-4">
                                        {[
                                            "Connect with like-minded volunteers",
                                            "Make measurable impact",
                                            "Build stronger communities",
                                        ].map((feature, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-center gap-3 text-gray-700"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-300 to-purple-300 flex items-center justify-center flex-shrink-0">
                                                    <i className="ri-check-line text-white text-sm"></i>
                                                </div>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Second Row */}
                        <div className="flex flex-col items-center gap-10 lg:flex-row about-row">
                            <div className="w-full lg:w-1/2 lg:order-1 order-0 group">
                                <div className="relative">
                                    <img
                                        src={futureVolunteer}
                                        alt="Volunteer Program Features"
                                        className="w-full sm:w-2/3 lg:w-full xl:w-2/3 mx-auto rounded-3xl shadow-xl -skew-y-2 about-img group-hover:skew-y-0 transition-all duration-500"
                                    />
                                    {/* Gradient overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-purple-500/0 to-indigo-500/0 group-hover:from-pink-500/20 group-hover:via-purple-500/20 group-hover:to-indigo-500/20 rounded-3xl transition-all duration-500 w-full sm:w-2/3 lg:w-full xl:w-2/3 mx-auto" />
                                </div>
                            </div>

                            <div className="w-full lg:w-1/2 lg:order-0 about-text order-1">
                                <div className="space-y-6 px-4">
                                    {/* Icon badge */}
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full">
                                        <span className="text-2xl">✨</span>
                                        <span className="text-purple-700 font-semibold text-sm">
                                            Features
                                        </span>
                                    </div>

                                    <h3 className="text-gray-800">
                                        Essential Features for Your{" "}
                                        <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent font-lobster">
                                            Volunteer Program
                                        </span>
                                    </h3>

                                    <p className="text-gray-700 text-lg leading-relaxed">
                                        Our comprehensive platform provides everything you need to
                                        manage, track, and grow your volunteer programs. From event
                                        creation to impact tracking, we've got you covered.
                                    </p>

                                    {/* Feature grid */}
                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        {[
                                            {
                                                icon: "ri-calendar-check-line",
                                                text: "Event Management",
                                            },
                                            { icon: "ri-team-line", text: "Team Coordination" },
                                            { icon: "ri-line-chart-line", text: "Impact Analytics" },
                                            { icon: "ri-award-line", text: "Achievement Badges" },
                                        ].map((feature, idx) => (
                                            <div
                                                key={idx}
                                                className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl hover:shadow-md transition-shadow"
                                            >
                                                <i
                                                    className={`${feature.icon} text-3xl text-purple-600`}
                                                ></i>
                                                <span className="text-sm text-gray-700 text-center font-medium">
                                                    {feature.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Reviews Section with enhanced brand styling */}
                <section id="review" className="py-20 relative overflow-hidden">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" />

                    <div className="relative z-10">
                        {/* Section Header */}
                        <div className="flex flex-col items-center gap-4 text-center mb-16">
                            <h2 className="font-lobster text-5xl">
                                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    What People Say
                                </span>
                            </h2>
                            <p className="text-gray-600 max-w-2xl text-lg">
                                Hear from our amazing community of volunteers
                            </p>
                            <div className="w-24 h-1 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 rounded-full" />
                        </div>

                        {/* Reviews Carousel */}
                        <div className="container mx-auto px-6">
                            <Swiper
                                modules={[Pagination, Navigation, Autoplay]}
                                spaceBetween={30}
                                slidesPerView={1}
                                pagination={{
                                    clickable: true,
                                    dynamicBullets: true,
                                }}
                                autoplay={{
                                    delay: 4000,
                                    disableOnInteraction: false,
                                    pauseOnMouseEnter: true,
                                }}
                                loop={true}
                                breakpoints={{
                                    640: { slidesPerView: 1 },
                                    768: { slidesPerView: 2 },
                                    1024: { slidesPerView: 3 },
                                }}
                                className="pb-16"
                            >
                                {[
                                    {
                                        text: "VolunteerHub helped me find meaningful opportunities that align with my passion for environmental conservation. The platform is intuitive and the community is amazing!",
                                        name: "Sarah Johnson",
                                        role: "Environmental Activist",
                                        gradient: "from-indigo-300 to-indigo-400",
                                        bgGradient: "from-indigo-50 to-indigo-100",
                                    },
                                    {
                                        text: "As an organization, managing volunteers has never been easier. The tools provided by VolunteerHub streamlined our entire process and increased engagement significantly.",
                                        name: "Michael Chen",
                                        role: "NGO Director",
                                        gradient: "from-purple-300 to-purple-400",
                                        bgGradient: "from-purple-50 to-purple-100",
                                    },
                                    {
                                        text: "I've made lifelong friends through VolunteerHub while making a real difference in my community. It's more than a platform—it's a movement!",
                                        name: "Emily Rodriguez",
                                        role: "Community Volunteer",
                                        gradient: "from-pink-300 to-pink-400",
                                        bgGradient: "from-pink-50 to-pink-100",
                                    },
                                    {
                                        text: "The badge and tracking system keeps me motivated to continue volunteering. Seeing my impact grow over time is incredibly rewarding!",
                                        name: "David Park",
                                        role: "Student Volunteer",
                                        gradient: "from-indigo-300 via-purple-300 to-pink-300",
                                        bgGradient: "from-indigo-50 via-purple-50 to-pink-50",
                                    },
                                ].map((review, idx) => (
                                    <SwiperSlide key={idx}>
                                        <div
                                            className={`group flex flex-col gap-6 bg-gradient-to-br ${review.bgGradient} rounded-2xl p-8 hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 border border-white/50 h-full relative overflow-hidden`}
                                        >
                                            {/* Quote icon background */}
                                            <div
                                                className={`absolute -top-4 -right-4 text-8xl opacity-10 bg-gradient-to-br ${review.gradient} bg-clip-text text-transparent`}
                                            >
                                                <i className="ri-double-quotes-r"></i>
                                            </div>

                                            {/* Star rating */}
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <i
                                                        key={i}
                                                        className={`ri-star-fill text-xl bg-gradient-to-r ${review.gradient} bg-clip-text text-transparent`}
                                                    ></i>
                                                ))}
                                            </div>

                                            {/* Review text */}
                                            <p className="text-gray-700 leading-relaxed text-base flex-grow relative z-10">
                                                "{review.text}"
                                            </p>

                                            {/* Reviewer info */}
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div
                                                    className={`w-14 h-14 rounded-full bg-gradient-to-br ${review.gradient} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                                                >
                                                    {review.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </div>
                                                <div className="flex-grow">
                                                    <p className="font-bold text-gray-800">
                                                        {review.name}
                                                    </p>
                                                    <p className="text-sm text-gray-600">{review.role}</p>
                                                </div>
                                                <div
                                                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${review.gradient} opacity-20 group-hover:opacity-40 transition-opacity`}
                                                />
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>
                </section>

                {/* Call to Action Section */}
                <section className="py-20 px-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMCAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAzIi8+PC9nPjwvc3ZnPg==')] opacity-30" />

                    <div className="container mx-auto max-w-4xl relative z-10 text-center">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Ready to Make a Difference?
                        </h2>
                        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                            Join thousands of volunteers making positive change in communities
                            worldwide
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => naviageLogin()}
                                className="group px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-50 hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <span>Join Now</span>
                                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => scrollToSection("about")}
                                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-xl font-bold text-lg hover:bg-white/20 hover:shadow-2xl hover:scale-105 transition-all duration-300"
                            >
                                Learn More
                            </button>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12 px-6">
                    <div className="container mx-auto max-w-6xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                            {/* Brand */}
                            <div>
                                <h3 className="font-lobster text-3xl mb-4">
                                    <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                                        VolunteerHub
                                    </span>
                                </h3>
                                <p className="text-gray-400 mb-4">
                                    Connecting passionate hearts with meaningful volunteer
                                    opportunities.
                                </p>
                                <div className="flex gap-3">
                                    {[
                                        { icon: "ri-facebook-fill", color: "hover:bg-indigo-600" },
                                        { icon: "ri-instagram-fill", color: "hover:bg-pink-600" },
                                        { icon: "ri-twitter-fill", color: "hover:bg-purple-600" },
                                        { icon: "ri-youtube-fill", color: "hover:bg-red-600" },
                                    ].map((social, idx) => (
                                        <button
                                            key={idx}
                                            className={`w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center ${social.color} hover:scale-110 transition-all duration-300`}
                                        >
                                            <i className={`${social.icon} text-lg`}></i>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h4 className="font-bold text-lg mb-4">Quick Links</h4>
                                <ul className="space-y-2">
                                    {navItems.map((item) => (
                                        <li key={item.id}>
                                            <button
                                                onClick={() => scrollToSection(item.id)}
                                                className="text-gray-400 hover:text-purple-400 transition-colors"
                                            >
                                                {item.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Contact */}
                            <div>
                                <h4 className="font-bold text-lg mb-4">Get in Touch</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li className="flex items-center gap-2">
                                        <i className="ri-mail-line text-purple-400"></i>
                                        <span>info@volunteerhub.com</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <i className="ri-phone-line text-purple-400"></i>
                                        <span>+1 (555) 123-4567</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <i className="ri-map-pin-line text-purple-400"></i>
                                        <span>Vinhomes Smart City, Tay Mo, Hanoi</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Copyright */}
                        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
                            <p>
                                &copy; {new Date().getFullYear()} VolunteerHub. All rights
                                reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default LandingPage;
