import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2";

interface Author {
  author_id: number;
  name: string;
  phone: string;
  country: string;
}

interface Country {
  country_id: number;
  title: string;
  code: string;
}


// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req: Request) => {

  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Authenticate in header with "Bearer "
  const authHeader = req.headers.get("Authorization") || "";

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);


  if (authError || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Query parameters
  const url = new URL(req.url);
  const action = url.searchParams.get("action");


  if (action === "getAuthorsWithMoreThan5Books") {

    // Get all authors
    const { data: authors, error: authorsError } = await supabase
      .from("Authors")
      .select("author_id, name");

    if (authorsError) {
      return new Response("Error fetching authors", { status: 500 });
    }

    // Count books for each author
    const authorsWithBookCounts = await Promise.all(
      authors.map(async (author) => {
        const { count } = await supabase
          .from("Books")
          .select("*", { count: "exact", head: true })
          .eq("author_id", author.author_id);

        return { ...author, book_count: count };
      })
    );

    // Filter authors with more than 5 books
    const filteredAuthors = authorsWithBookCounts.filter(author => author.book_count >= 5);

    return new Response(JSON.stringify(filteredAuthors), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } else if (action === "getAverageBookPriceByCountry") {

    // Get authors with countries and book, prices
    const { data: authors, error: authorsError } = await supabase
      .from("Authors")
      .select(`
        author_id,
        country:country_id (title),
        Books (price)
      `);

    if (authorsError) {
      return new Response("Error fetching authors", { status: 500 });
    }

    // Average price per country
    const countryPrices = authors.reduce((acc, author) => {
      const country = author.country?.title; // Get country title
      const prices = author.Books?.map((book) => book.price) || [];

      if (prices.length > 0) {
        if (!acc[country]) {
          acc[country] = [];
        }
        acc[country].push(...prices);
      }
      return acc;
    }, {});

    const averagePrices = Object.entries(countryPrices).map(([country, prices]) => {
      const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      return { country, average_price: averagePrice };
    });

    return new Response(JSON.stringify(averagePrices), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

})