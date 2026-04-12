import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Loader2, ExternalLink } from "lucide-react";

export default function Ministries() {
  const ministriesQuery = trpc.ministries.list.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}\n      <section className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Our Ministry Partners</h1>
          <p className="text-xl text-amber-100 max-w-2xl mx-auto">
            Every coffee purchase directly supports one of these incredible organizations making a real difference in the world.
          </p>
        </div>
      </section>

      {/* Ministries Grid */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {ministriesQuery.isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-amber-900" />
            </div>
          ) : ministriesQuery.data && ministriesQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ministriesQuery.data.map((ministry, index) => (
                <Card key={ministry.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                  {ministry.imageUrl && (
                    <div className="h-64 bg-amber-100 overflow-hidden">
                      <img
                        src={ministry.imageUrl}
                        alt={ministry.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-amber-900">{ministry.name}</h3>\n                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-amber-700 text-sm leading-relaxed mb-4 flex-grow">
                      {ministry.description}
                    </p>
                    {ministry.websiteUrl && (
                      <a
                        href={ministry.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium text-sm"
                      >
                        Learn More
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-amber-900 mb-2">Coming Soon</h2>
              <p className="text-amber-700">Ministry partners are being added. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-amber-900 text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Your Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">100%</div>
              <p className="text-amber-100">of proceeds go directly to ministry partners</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">Global</div>
              <p className="text-amber-100">supporting missions and communities worldwide</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">Transparent</div>
              <p className="text-amber-100">full visibility into where your money goes</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-amber-900 mb-4">Ready to Make a Difference?</h2>
          <p className="text-lg text-amber-700 mb-8">
            Choose your favorite coffee and select a ministry to support with your purchase.
          </p>
          <Link href="/shop">
            <Button size="lg" className="bg-amber-900 hover:bg-amber-800">
              Shop Coffee Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
