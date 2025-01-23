import React from "react";
import { Link } from "react-router-dom";
function Home() {
  return (
    <>
      <div>
        <Link to="/login">
          <button>Go to Login</button>
        </Link>
        <Link to="/register">
          <button>Go to Register</button>
        </Link>
        <div>
          <img
            src="https://student-cms.prd.timeshighereducation.com/sites/default/files/styles/default/public/2023-05/iStock-1371940128.jpg?itok=t4ZO_mEd"
            alt="Happy students smiling and enjoying their time together"
            style={{ width: "30%", borderRadius: "8px" }}
          />
          <img
            src="https://student-cms.prd.timeshighereducation.com/sites/default/files/styles/default/public/2023-05/iStock-1371940128.jpg?itok=t4ZO_mEd"
            alt="Happy students smiling and enjoying their time together"
            style={{ width: "30%", borderRadius: "8px" }}
          />
          <img
            src="https://student-cms.prd.timeshighereducation.com/sites/default/files/styles/default/public/2023-05/iStock-1371940128.jpg?itok=t4ZO_mEd"
            alt="Happy students smiling and enjoying their time together"
            style={{ width: "30%", borderRadius: "8px" }}
          />
        </div>

        <p>
          Hypothetical City College Study Abroad Program Discover the world and
          expand your horizons with the Hypothetical City College (HCC) Study
          Abroad Program! Designed to provide students with transformative
          global experiences, our program offers immersive opportunities to
          study, live, and grow in diverse cultural settings around the globe.
          **Program Highlights:** 1. **Global Destinations:** Choose from a wide
          range of locations including Europe, Asia, South America, and beyond.
          Each destination is carefully selected to provide rich educational and
          cultural experiences. 2. **Academic Excellence:** Earn credits towards
          your degree while studying at prestigious partner institutions. Our
          programs include a variety of disciplines, ensuring students from all
          majors can participate. 3. **Cultural Immersion:** Engage with local
          communities through language courses, cultural activities, and
          service-learning opportunities. Gain a deeper understanding of
          different perspectives and traditions. 4. **Affordable
          Opportunities:** We believe in making study abroad accessible.
          Scholarships, grants, and financial aid are available to eligible
          students, helping to reduce program costs. 5. **Personal Growth:**
          Develop valuable life skills such as adaptability, independence, and
          intercultural communication. Return home with a broader worldview and
          experiences that will enrich your personal and professional life.
          **Who Can Apply?** The HCC Study Abroad Program is open to all
          currently enrolled students who meet academic and conduct
          requirements. Whether you're a first-time traveler or an experienced
          globetrotter, our program has something to offer. **How to Get
          Started:** 1. Attend an informational session to learn about program
          options, costs, and application deadlines. 2. Meet with a study abroad
          advisor to explore destinations and tailor the program to your
          academic goals. 3. Submit your application and prepare for the journey
          of a lifetime! **Why Choose HCC Study Abroad?** At Hypothetical City
          College, we are committed to empowering students with global
          experiences that inspire learning, foster personal growth, and prepare
          them for success in an interconnected world. Join us and embark on a
          journey that will shape your future. For more information, visit our
          Study Abroad Office or contact us at studyabroad@hcc.edu. Your
          adventure awaits!
        </p>
      </div>
    </>
  );
}

export default Home;
