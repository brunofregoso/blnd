"use client";
import Head from "next/head";
import React, { useEffect } from "react";
import Link from "next/link";
import { supabase } from "./lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Updated: Correct hook for navigation
import Navbar from "./components/Navbar"; // Import Navbar

export default function Home() {
  const router = useRouter(); // Use the Next.js router

  const getSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log(session);
    if (session) {
      console.log("User already logged in. Redirecting to dashboard.");
      router.push("/../dashboard");
    }
  };

  useEffect(() => {
    getSession();
  }, []); // Fetch session on page load

  const login = async () => {
    try {
      // Initiate OAuth login
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "spotify",
        options: {
          redirectTo: "http://localhost:3000/dashboard",
          scopes: 'playlist-modify-public playlist-modify-private',
        },
      });

      if (error) {
        console.error("Error initiating login:", error.message);
        return;
      }

      // Listen to the auth state change
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          console.log("User logged in:", session.user);

          // Sync the user's profile with Supabase
          await syncUserProfile(session.user);

          // Redirect to dashboard after successful login
          router.push("/dashboard");
        }
      });
    } catch (error) {
      console.log("Error logging in:", error);
    }
  };

  // Function to sync the user profile
 // Function to sync the user profile
const syncUserProfile = async (user) => {
  console.log("Attempting to sync user profile:", user); // Debug statement

  const { id, email, user_metadata } = user;
  try {
    // Check if the profile already exists
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (selectError) {
      console.error("Error checking for existing profile:", selectError);
    }

    // If the profile doesn't exist, insert it
    if (!existingProfile) {
      const { error: insertError } = await supabase.from('profiles').insert([
        {
          id,
          email,
          display_name: user_metadata.full_name || user_metadata.name || "Unknown User",
          spotify_id: user_metadata.spotify_id || user_metadata.sub,
          avatar_url: user_metadata.avatar_url || "",
        },
      ]);

      if (insertError) {
        console.error('Error inserting profile:', insertError);
      } else {
        console.log("Profile successfully inserted");
      }
    } else {
      console.log("Profile already exists:", existingProfile);
    }
  } catch (error) {
    console.error("Error syncing user profile:", error);
  }
};


  return (
    <body>
      <Head>
        <title>BLND</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Add Navbar */}
      <Navbar />

      <main className="min-h-screen pt-16">
        {" "}
        {/* Adjust padding to account for the navbar */}
        <section className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">
              Blend Your Music with Friends Seamlessly
            </h2>
            <p className="text-lg font-semibold">
              BLND utilizes Spotify to mash playlists to create a
              diversified experience!
            </p>
            <div className="flex justify-center space-x-4 mb-8 mt-10 ">
              <button
                className="btn  max-w-3xl w-40 text-xl font-bold bg-slate-200 hover:text-slate-200 hover:bg-yellow-500"
                onClick={login}
              >
                Login
              </button>
            </div>
            {/* <Image src="/public/sp1.svg" alt="Hero Image" width={1000} height={1000} /> */}
          </div>
        </section>
        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-center mb-8">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-200 shadow-lg rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105">
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2">Feature 1</h3>
                <p className="text-gray-600 font-extrabold">
                  Allows you to do amazing things with your music
                </p>
              </div>
            </div>

            <div className="bg-slate-200 shadow-lg rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105">
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2">Feature 2</h3>
                <p className="text-gray-600 font-extrabold">
                  Experience seamless integration with your favorite platforms
                </p>
              </div>
            </div>

            <div className="bg-slate-200 shadow-lg rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105">
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2">Feature 3</h3>
                <p className="text-gray-600 font-extrabold">
                  Collaborate with friends and share your playlists easily
                </p>
              </div>
            </div>

            {/* Add more features as needed */}
          </div>
        </section>
        {/*About Section */}
        <section id="about" className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-center mb-8">About</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-200 shadow-lg rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105">
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2">About Us</h3>
                <p className="text-gray-600 font-extrabold">
                  At BLND, we are a dedicated team of music lovers committed to
                  enhancing the way you connect with friends through music. We
                  believe in the power of shared experiences and aim to create a
                  platform that brings people together, no matter the distance
                </p>
              </div>
            </div>

            <div className="bg-slate-200 shadow-lg rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105">
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2">Our Mission</h3>
                <p className="text-gray-600 font-extrabold">
                  Our mission is to revolutionize virtual listening by making it
                  interactive and enjoyable. We strive to empower users to blend
                  playlists, discover new sounds, and create memorable moments
                  together, transforming how music is experienced in the digital
                  age
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Contact Section */}
        {/* Contact Section */}
        <section id="contact" className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-center mb-8">Contact</h2>
          <div className="flex justify-center">
            <div className="bg-slate-200 shadow-lg rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105">
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2">Contact Us</h3>
                <p className="text-gray-600 font-extrabold">
                  For any inquiries or feedback, please reach out to us at
                  <a
                    href="mailto:help@blndmiami.com"
                    className="text-blue-500 underline"
                  >
                    {" "}
                    help@blndmiami.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>
        <footer>
          <div className="container mx-auto px-4 py-6">
            <p className="text-center">
              © 2024 BLND. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </body>
  );
}
