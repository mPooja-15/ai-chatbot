module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx}',
      './components/**/*.{js,ts,jsx,tsx}',
      './src/**/*.{js,ts,jsx,tsx}',
     ],
    // purge: [],
    darkMode: "media", // or 'media' or 'class'
    theme: {
      listStyleType: {
        none: 'none',
        disc: 'disc',
        decimal: 'decimal',
        square: 'square',
        roman: 'upper-roman',
      },
      extend: {
        colors: {
          primary: "#26388a",
          secondary: "#e95757", 
          tertiary : "#082365",
          dark : "#263648",  
          lightGray : "#0000001a",
          bgGray :"#F5F5F5",
         darkGary :"#F0F0F0",
         mainBg:"#f1f6fb",
         newBlue : "#1258fc",
         blueHeader : "#3C6EF5",
         OrangeBuilder : "#ED754B",
         FontGray : "#8a98a2",
         darkBlack :"#263238",
         greenShade : "#58AA43",
         purpleShade : "#383DD3",
         navyBlue : "#8055D9",
         logoRed : "#DC4B35", 
         darkblue :"#050B43"
        },
        backgroundImage: {
           
        },
      },
      fontFamily: {
        main : ['Source Sans Pro', 'sans-serif'],
        poppins : ['Poppins', 'sans-serif'],
        noto : ['Noto Sans', 'sans-serif'],
        strawford: ['Strawford', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        inter : ['Inter', 'sans-serif'],
        monospace : ['Monospace', 'sans-serif'],
        cursive: ['Cedarville-Cursive', 'sans-serif'],
        fantasy: ['MorrisRoman-Black', 'sans-serif']
       },
      screens: {
        xms:"320px",
        xs: "500px",
        sm: "640px",
        // => @media (min-width: 640px) { ... }
  
        md: "768px",
        // => @media (min-width: 768px) { ... }
  
        lg: "1024px",
        // => @media (min-width: 1024px) { ... }
  
        xl: "1280px",
        // => @media (min-width: 1280px) { ... }
  
        "2xl": "1536px",
        // => @media (min-width: 1536px) { ... }
  
        "3xl": "1920px",
        // => @media (min-width: 1536px) { ... }
      },
    },
    variants: {
      extend: {},
    },
    plugins: [
      require("tailwind-scrollbar-hide"),
      require("tailwind-scrollbar"),
      require("daisyui"),
      
    ],
    daisyui: {
      styled: true,
      themes: true,
      base: true,
      utils: true,
      logs: true,
      rtl: false,
      prefix: "",
      darkTheme: "light",
    },
  };
  