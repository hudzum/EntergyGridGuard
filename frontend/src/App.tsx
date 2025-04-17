import React from "react";
import { IconRow, Navbar } from "./components/NavBar";
import { Button } from "./components/ui/button";

import {
  Carousel,
  CarouselContent,
  CarouselPrevious,
  CarouselNext,
  CarouselItem,
} from "./components/ui/carousel";
import CarChild from "./components/CarouselItem";
import Autoplay from "embla-carousel-autoplay";
function App() {
  return (
    <div className="min-h-screen bg-zinc-300 flex flex-col w-full">
      <Navbar />

      <main className="flex-col flex items-center justify-center w-full px-4 py-8">
        <div className="bg-zinc-50   rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-col items-center py-12 px-4 md:px-8 lg:px-12">
            {/* Main title */}
            <div className="text-center w-full max-w-3xl mx-auto mb-12">
              <h1 className="text-3xl md:text-5xl font-bold mb-6 text-black">
                <span className="text-transparent bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text">
                  ERIC
                </span>{" "}
                powered by Entergy
              </h1>
              <p className="text-zinc-600 text-lg mb-8 max-w-2xl mx-auto">
                Harnessing AI to Help Entergy Technicians Quickly Locate and
                Repair Damaged Power Poles with Precision and Efficiency.
              </p>
              <Button className="bg-rose-500">Learn More</Button>
            </div>

            <div className=" relative w-full flex flex-col items-center justify-center mt-4 ">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-[90%] h-40 bg-rose-500/30 rounded-full blur-3xl"></div>

              <Carousel
                className="max-w-4xl w-full"
                plugins={[
                  Autoplay({
                    delay: 10000,
                  }),
                ]}
              >
                <CarouselContent>
                  <CarouselItem>
                    <div className="flex justify-center p-4 ">
                      <CarChild
                        imagePath="./carousel/carousel1.png"
                        initialTitle="LLM-Powered Damage Analytics"
                        initialDescription="Get in-depth breakdowns of pole components and damage severity with our AI-driven analytics. Our system provides clear, concise descriptions, ensuring you understand the condition of each structure at a glance."
                        onTitleChange={(title) => console.log(title)}
                        onDescriptionChange={(desc) => console.log(desc)}
                      />
                    </div>
                  </CarouselItem>

                  <CarouselItem>
                    <div className="flex justify-center p-4">
                      <CarChild
                        imagePath="./carousel/carousel2.png"
                        initialTitle="Intelligent Pole Database"
                        initialDescription="Effortlessly store and retrieve utility pole data with our intuitive database system. Navigate through records seamlessly, query specific poles with ease, and access structured insights—all in one streamlined interface."
                        onTitleChange={(title) => console.log(title)}
                        onDescriptionChange={(desc) => console.log(desc)}
                      />
                    </div>
                  </CarouselItem>

                  <CarouselItem>
                    <div className="flex justify-center p-4">
                      <CarChild
                        imagePath="./carousel/carousel3.png"
                        initialTitle="AI Generated Damage Reports"
                        initialDescription="Transform raw data into comprehensive reports with a single click. Our AI compiles detailed component analyses, damage assessments, and key takeaways, giving you professional-grade insights instantly."
                        onTitleChange={(title) => console.log(title)}
                        onDescriptionChange={(desc) => console.log(desc)}
                      />
                    </div>
                  </CarouselItem>
                </CarouselContent>
                <div className="flex justify-center items-center space-x-4 mt-4">
                  <CarouselPrevious />
                  <CarouselNext />
                </div>
              </Carousel>
            </div>
          </div>

          {/* Navigation Icons Links */}
          <IconRow />

          {/*About Us*/}

          {/*About Us*/}
          <div className="flex flex-col w-full max-w-4xl items-center justify-center text-center mx-auto mt-4">
            <h2 className="text-xl font-bold mb-6 text-black">About Us</h2>

            <img
              src="./team.jpeg"
              alt="dashboard"
              className=" w-2/3 rounded-lg border border-gray-200 shadow-lg mb-4"
            />

            <p className="text-zinc-600 text-sm mb-8 max-w-2xl mx-auto">
              We are a team of LSU students passionate about leveraging AI to
              solve real-world challenges. Collaborating with experienced
              mentors from Entergy, Our goal is to streamline damage assessment
              with intelligent databases, AI-powered analytics, and automated
              reporting—helping industries make faster, data-driven decisions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
