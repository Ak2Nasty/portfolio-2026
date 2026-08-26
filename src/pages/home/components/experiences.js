/* The experience data, lifted out of Career12 so the card template and the
   /card-lab preview both read from one source. Field notes live with the
   entries that use them. */
export const experiences = [
    {
      company: "D2L",
      frontLogoScale: "scale-[1.07]",
      logoScale: "scale-[1.14]",
      brandColor: "#3CF028",
      metric: "30", metricSuffix: "%", metricLabel: "COST REDUCTION",
      logo: "/d2l-inverted.png",
      role: "Customer Marketing & Events Coordinator",
      summary: [
        "Led a global vendor transition project, delivering a <strong class=\"font-medium text-[#f4f4f4]\">30% reduction</strong> in event costs.",
        "Analyzed pipeline data using <strong class=\"font-medium text-[#f4f4f4]\">Power BI</strong> to optimize targeted outreach and post-event engagement.",
        "Orchestrated end-to-end logistics for hybrid trade shows and cross-channel campaigns."
      ],
      metadata: "VANCOUVER, BC • CO-OP • SEP 2023 - DEC 2023",
      link: "/work-sample#d2l"
    },
    {
      company: "OKHC",
      frontLogoScale: "scale-[0.60]",
      logoScale: "scale-[0.67]",
      brandColor: "#6CBF4B",
      metric: "8",  metricSuffix: "",  metricLabel: "CLIENT-READY ASSETS",
      logo: "/okhc-logo-transparent.png",
      logoClass: "brightness-0 invert",
      role: "Marketing & Communications Consultant",
      summary: [
        "Conducted a comprehensive <strong class=\"font-medium text-[#f4f4f4]\">marketing audit</strong> and designed an organic and paid social media strategy.",
        "Delivered <strong class=\"font-medium text-[#f4f4f4]\">8 client-ready assets</strong>, including a full website redesign mockup, AI chatbot, gallery, and contact architecture.",
        "Produced government-facing fact sheets and directed communications for board-level stakeholders."
      ],
      metadata: "KELOWNA, BC • UBC CAPSTONE • JAN 2025 - APR 2025",
      link: "/work-sample#okhc"
    },
    {
      company: "Foot Locker",
      frontLogoScale: "scale-[0.615]",
      // Referee mark carries no wordmark, so the closed face uses the full logo.
      // Keyed out of the source JPEG's flat #EEEEEE field into real alpha and
      // cropped to the ink, rather than blended out in CSS: the faces sit in a
      // 3D rendering context (preserve-3d + backface-visibility), which flattens
      // mix-blend-mode, so the field stayed on screen as a black square.
      frontLogo: "/footlocker-wordmark.png",
      logoScale: "scale-[0.98]",
      brandColor: "#FFFFFF",
      metric: "2.5", metricPrefix: "$", metricSuffix: "K+", metricLabel: "WEEKLY SALES",
      // The referee mark is already white-on-black, and the container blends
      // with screen, so the black drops out on its own. Inverting it (as the old
      // wordmark PNG needed) would flip the artwork's frame to a white box.
      logo: "/footlocker-referee.svg",
      logoClass: "filter-none",
      role: "Sales Associate",
      summary: [
        "Generated <strong class=\"font-medium text-[#f4f4f4]\">$2,500+ in weekly sales</strong> through tailored recommendations across high-ticket footwear lines.",
        "Delivered client-focused communication to provide clear, effective <strong class=\"font-medium text-[#f4f4f4]\">product recommendations</strong>.",
        "Supported operational execution by organizing inventory and upholding <strong class=\"font-medium text-[#f4f4f4]\">visual merchandising standards</strong>."
      ],
      metadata: "KELOWNA, BC • RETAIL OPERATIONS • NOV 2025 - PRESENT",
      link: null
    },
    {
      company: "UBC MSA",
      frontLogoScale: "scale-[1.07]",
      logoScale: "scale-[1.19]",
      brandColor: "#72BF44",
      metric: "50", metricSuffix: "+", metricLabel: "EVENT ATTENDANCE",
      logo: "/msa-logo.png",
      logoClass: "grayscale invert contrast-200",
      role: "President, Marketing Club",
      summary: [
        "Developed external sponsorships and coordinated <strong class=\"font-medium text-[#f4f4f4]\">co-branded benefits</strong> across promotional channels.",
        "Directed digital content and social media strategy, producing brand-aligned materials using <strong class=\"font-medium text-[#f4f4f4]\">Photoshop and Canva</strong>.",
        "Organized 3 campus-wide events drawing <strong class=\"font-medium text-[#f4f4f4]\">up to 50 participants</strong>, managing budgets and timelines across a four-member team."
      ],
      metadata: "KELOWNA, BC • STUDENT LEADERSHIP • AUG 2022 - APR 2023",
      link: "/work-sample#marketing-club"
    },
    {
      company: "Nestlé Nespresso",
      frontLogoScale: "scale-[0.61]",
      logoScale: "scale-[0.68]",
      brandColor: "#C8A882",
      metric: "8",  metricSuffix: "%", metricLabel: "SALES INCREASE",
      logo: "/nespresso-idr.svg",
      logoClass: "brightness-0 invert",
      role: "Sales Associate",
      summary: [
        "Delivered personalized product messaging and live demonstrations, contributing to an <strong class=\"font-medium text-[#f4f4f4]\">8% increase in sales</strong>.",
        "Designed and maintained brand-aligned visual merchandising to drive <strong class=\"font-medium text-[#f4f4f4]\">consumer engagement</strong>.",
        "Leveraged front-line customer insights to tailor recommendations and resolve inquiries."
      ],
      metadata: "KELOWNA, BC • CONSUMER ENGAGEMENT • NOV 2022 - APR 2023",
      link: "/work-sample#nespresso"
    },
    {
      company: "CUBS Vancouver",
      frontLogoScale: "scale-[2.42]",
      frontLogoClass: "grayscale invert contrast-200",
      logoScale: "scale-[2.73]",
      brandColor: "#D9A05B",
      metric: "1",  metricSuffix: "",  metricLabel: "CAMPAIGN DELIVERED",
      logo: "/cubs-logo.png",
      // Cropped to its ink; the source file is 38%x19% artwork on a portrait canvas
      tabLogo: "/cubs-tab.png",
      // scale/translate dropped with the old inline layout — in the corner
      // watermark position they pushed the mark further off the card
      logoClass: "grayscale invert contrast-200",
      role: "Graphic Designer",
      summary: [
        "Developed content strategies and wrote high-converting <strong class=\"font-medium text-[#f4f4f4]\">copy</strong> for social media campaigns.",
        "Designed engaging social media visuals using <strong class=\"font-medium text-[#f4f4f4]\">Photoshop and Illustrator</strong> to align with campaign goals.",
        "Promoted tutoring and education services specifically targeted toward <strong class=\"font-medium text-[#f4f4f4]\">underserved communities</strong>."
      ],
      metadata: "VANCOUVER, BC • CREATIVE MARKETING • AUG 2022 - DEC 2022",
      link: "/work-sample#cubs"
    },
    {
      company: "Mindtree",
      // A 5:1 wordmark fills the 170px box widthwise long before it reaches the
      // cohort's ~9100px² bbox, so it has to overflow the box. The face is far
      // wider than the box, so nothing clips. Sized past the cohort figure
      // because thin-stroke marks read smaller than dense ones at equal bbox.
      frontLogoScale: "scale-[2.2]",
      frontLogo: "/mindtree-wordmark.svg",
      logoScale: "scale-[0.85]",
      brandColor: "#C80078",
      metric: "5",  metricSuffix: "%", metricLabel: "ATTRITION DROP",
      logo: "/mindtree-logo.svg",
      logoClass: "brightness-0 invert",
      role: "Acquisitions Student Intern",
      summary: [
        "Developed post-acquisition internal communications to ensure consistent messaging during <strong class=\"font-medium text-[#f4f4f4]\">organizational change</strong>.",
        "Conducted stakeholder analysis and industry research to identify risks and support <strong class=\"font-medium text-[#f4f4f4]\">executive decision-making</strong>.",
        "Collaborated cross-functionally to streamline policy updates, contributing to a <strong class=\"font-medium text-[#f4f4f4]\">5% reduction in employee attrition</strong>."
      ],
      metadata: "BANGALORE, INDIA • CORPORATE STRATEGY • SEP 2019 - JAN 2020",
      link: "/work-sample#mindtree"
    },
    {
      company: "EssEmm Corporation",
      // Lowest-density mark in the set; sized past the cohort bbox for the same
      // reason as Mindtree.
      frontLogoScale: "scale-[0.9]",
      logoScale: "scale-[0.89]",
      brandColor: "#E1251B",
      metric: "4",metricSuffix: "",  metricLabel: "YEARS OF SALES DATA",
      logo: "/essemm-logo.svg",
      logoClass: "brightness-0 invert",
      role: "Marketing Student Intern",
      summary: [
        "Conducted primary research through executive interviews and surveys to identify <strong class=\"font-medium text-[#f4f4f4]\">marketing strategy gaps</strong>.",
        "Analyzed <strong class=\"font-medium text-[#f4f4f4]\">four years of sales data</strong> to assess portfolio performance and growth opportunities.",
        "Presented data-driven recommendations to improve distribution, including an <strong class=\"font-medium text-[#f4f4f4]\">e-commerce application proposal</strong>."
      ],
      metadata: "COIMBATORE, INDIA • MARKETING STRATEGY • JUN 2019 - SEP 2019",
      link: "/work-sample#essemm"
    },
    {
      company: "Shure",
      frontLogoScale: "scale-[1.05]",
      logoScale: "scale-[1.01]",
      brandColor: "#B4FF3C",
      metric: "1st",metricSuffix: "",  metricLabel: "PLACE",
      logo: "/shure-logo.svg",
      // Very wide and short (4.2:1), so at the watermark's -bottom-10 bleed most
      // of it fell below the card edge. Lifted clear. The old md: resets undid
      // this on desktop and belonged to the previous inline-logo layout.
      logoClass: "brightness-0 invert",
      role: "1st Place Winner",
      summary: [
        "Developed an <strong class=\"font-medium text-[#f4f4f4]\">award-winning</strong> strategic marketing proposal for Shure's expansion in India.",
        "Analyzed target demographics and competitors to recommend highly <strong class=\"font-medium text-[#f4f4f4]\">localized sales strategies</strong>."
      ],
      metadata: "BANGALORE, INDIA • ACADEMIC PROJECT • MAR 2019",
      link: "/work-sample#shure"
    },
    {
      company: "Your Company Here",
      role: "Next Great Opportunity",
      isHighlight: true,
      summary: [
        "Ready to bring relentless execution and strategic vision to <strong class=\"font-medium text-[#f4f4f4]\">your team</strong>.",
        "Prepared to drive growth, solve complex challenges, and deliver <strong class=\"font-medium text-[#f4f4f4]\">high-impact results</strong>.",
        "Currently seeking opportunities to leverage my diverse background for your organization's <strong class=\"font-medium text-[#f4f4f4]\">next big win</strong>."
      ],
      metadata: "AVAILABLE FOR IMPACT • READY TO EXECUTE • 2026 & BEYOND",
      link: null
    }
];
