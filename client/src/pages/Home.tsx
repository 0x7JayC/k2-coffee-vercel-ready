import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Mountain, Heart, Users } from "lucide-react";

export default function Home() {
  const ministriesQuery = trpc.ministries.list.useQuery();
  const productsQuery = trpc.products.list.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white py-20 sm:py-32">
        <div className="absolute inset-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 600"
            preserveAspectRatio="xMidYMid slice"
          >
            <path
              d="M0,300 Q300,200 600,300 T1200,300 L1200,600 L0,600 Z"
              fill="currentColor"
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Mountain className="w-12 h-12 text-amber-200 mr-3" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              K2 Coffee
            </h1>
          </div>

          <p className="text-xl sm:text-2xl text-amber-100 mb-4">
            Premium Yunnan Arabica
          </p>
          <p className="text-lg text-amber-50 max-w-2xl mx-auto mb-8 leading-relaxed">
            Sourced from high-altitude farms in Yunnan, China. Every purchase
            supports ministries making a real difference in communities around
            the world.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
              <Button
                size="lg"
                className="bg-white text-amber-900 hover:bg-amber-50 w-full sm:w-auto"
              >
                Shop Coffee
              </Button>
            </Link>
            <Link href="/ministries">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-amber-900 w-full sm:w-auto"
              >
                Our Partners
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Ministries Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-amber-900 mb-4">
              Where Your Purchase Goes
            </h2>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto">
              Every coffee purchase directly supports one of our ministry
              partners
            </p>
          </div>

          {ministriesQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-amber-900" />
            </div>
          ) : ministriesQuery.data && ministriesQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {ministriesQuery.data.map((ministry) => (
                <Card
                  key={ministry.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow !py-0 gap-0"
                >
                  {ministry.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={ministry.imageUrl}
                        alt={ministry.name}
                        className="w-full h-full object-cover block"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-amber-900 mb-2">
                      {ministry.name}
                    </h3>
                    <p className="text-amber-700 text-sm leading-relaxed mb-4 line-clamp-3">
                      {ministry.description}
                    </p>
                    {ministry.websiteUrl && (
                      <a
                        href={ministry.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                      >
                        Learn More →
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-amber-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-amber-900 mb-4">
              Our Coffee Selection
            </h2>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto">
              Carefully sourced and roasted to perfection
            </p>
          </div>

          {productsQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-amber-900" />
            </div>
          ) : productsQuery.data && productsQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {productsQuery.data.slice(0, 3).map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow !py-0 gap-0"
                >
                  {product.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover block"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-amber-900 mb-1">
                      {product.name}
                    </h3>
                    {product.weight && (
                      <p className="text-xs uppercase tracking-wider text-amber-600 mb-3">
                        {product.weight}
                      </p>
                    )}
                    <p className="text-amber-700 text-sm leading-relaxed mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    {product.tastingNotes && (
                      <p className="text-xs text-amber-600 font-medium mb-4">
                        Notes: {product.tastingNotes}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-amber-900">
                        £{(product.price / 100).toFixed(2)}
                      </span>
                      <Link href="/shop">
                        <Button
                          size="sm"
                          className="bg-amber-900 hover:bg-amber-800"
                        >
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : null}

          <div className="text-center mt-12">
            <Link href="/shop">
              <Button size="lg" className="bg-amber-900 hover:bg-amber-800">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Heart className="w-12 h-12 text-amber-900" />
              </div>
              <h3 className="text-xl font-bold text-amber-900 mb-2">
                100% Purpose-Driven
              </h3>
              <p className="text-amber-700">
                Every purchase directly supports ministry partners making a
                tangible difference
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Mountain className="w-12 h-12 text-amber-900" />
              </div>
              <h3 className="text-xl font-bold text-amber-900 mb-2">
                Premium Quality
              </h3>
              <p className="text-amber-700">
                High-altitude Yunnan Arabica grown on volcanic red soil by
                smallholder families
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Users className="w-12 h-12 text-amber-900" />
              </div>
              <h3 className="text-xl font-bold text-amber-900 mb-2">
                Community Impact
              </h3>
              <p className="text-amber-700">
                Supporting missions, outreach, youth programs, and community
                development
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-amber-900 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Make an Impact?
          </h2>
          <p className="text-lg text-amber-100 mb-8">
            Choose your favorite coffee and select a ministry to support
          </p>
          <Link href="/shop">
            <Button
              size="lg"
              className="bg-white text-amber-900 hover:bg-amber-50"
            >
              Start Shopping
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
