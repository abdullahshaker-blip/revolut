import { GoogleGenAI, Type } from "@google/genai";
import type { ContentItem, UserProfile, InteractionEvent } from "../types";

// Assume API_KEY is set in the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const contentSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      type: {
        type: Type.STRING,
        description: "The type of content. Can be 'article', 'video', 'podcast', 'quote', or 'simulation'.",
        enum: ['article', 'video', 'podcast', 'quote', 'simulation']
      },
      title: {
        type: Type.STRING,
        description: "A captivating and concise title for the content item.",
      },
      description: {
        type: Type.STRING,
        description: "A detailed, engaging description of the content, written to spark curiosity.",
      },
      tags: {
        type: Type.ARRAY,
        description: "A list of 2-3 relevant keywords or tags.",
        items: {
          type: Type.STRING,
        },
      },
      imageQuery: {
          type: Type.STRING,
          description: "A short, descriptive query of 2-3 words to find a suitable, high-quality, and visually stunning background image. Example: 'nebula cosmos', 'minimalist architecture', 'bioluminescent forest'."
      }
    },
    required: ["type", "title", "description", "tags", "imageQuery"],
  },
};

function constructPrompt(profile: UserProfile): string {
  const history = profile.interactionHistory.length > 0
    ? `The user's recent interaction history is a sequence of structured JSON events. Here are the latest events:
       ${profile.interactionHistory.map(e => JSON.stringify(e)).join('\n')}
       
       Carefully interpret this nuanced data to build a psychographic profile and predict the user's latent interests. Here is a guide to interpreting the event types:

       **Core Engagement Signals (Highest Importance):**
       - 'eventType: "like"': An explicit and very strong positive signal.
       - 'eventType: "total_dwell_time"': A high 'durationMs' (e.g., > 60000ms) indicates sustained interest. A low duration is neutral.
       - 'eventType: "quick_exit"': A 'durationMs' under 3000ms is a VERY STRONG NEGATIVE signal. The content was immediately rejected.

       **Video Interaction Signals:**
       - 'eventType: "video_watch_progress"': 'watchPercent' is a powerful metric. > 85% is high engagement. < 20% indicates clear disinterest. 20-85% is moderate interest.
       - 'eventType: "video_rewind"': This is an EXTREMELY STRONG signal of interest in the specific moment of the video. Note the 'seekFromS' and 'seekToS' to understand what was re-watched.
       - 'eventType: "video_seek_forward"': A strong negative signal for the content that was skipped.
       - 'eventType: "video_rate_change"': A 'playbackRate' > 1 might mean the user is trying to get through content quickly, a weaker engagement signal.
       
       **Article Interaction Signals:**
       - 'eventType: "dwell_on_element"': A 'durationMs' > 2000ms on a specific element ('img', 'p', 'pre') reveals deep curiosity about that specific part of the content. This is a very strong signal.
       - 'eventType: "text_selection"': The 'selectedText' provides invaluable, explicit insight into the exact concept the user is focused on. This is a top-tier signal.
       - 'eventType: "avg_scroll_speed"': A low 'speedPxs' (e.g., < 500) implies careful reading (positive). A high speed implies skimming or disinterest (negative).
       - 'eventType: "scroll_depth"': A high 'scrollPercent' (e.g., > 90%) is a good sign, but must be cross-referenced with scroll speed. High depth + low speed = high engagement.
       - 'eventType: "scroll_bounce"': This is a negative signal indicating the user scrolled through the content without finding anything of interest.

       Synthesize these signals to understand not just WHAT the user likes, but HOW they engage with different types of content and ideas. Use these deep insights to predict what will fascinate them next.`
    : "This is the user's first session. Provide a diverse and broadly appealing set of inspiring content to begin learning their preferences.";
    
  return `
    You are the "Empathetic Engine" for an application called "Nexus Personale". 
    Your purpose is to act as a digital extension of the user's consciousness, providing a hyper-personalized stream of inspiring content.
    You are predictive, not just reactive. Your goal is to expand the user's horizons and introduce them to topics they don't even know they'll love yet.
    The content should promote personal growth, curiosity, and intellectual discovery, not just passive entertainment.

    Based on the following user profile, generate a list of 8 new, unique, and deeply engaging content suggestions.
    Connect concepts in unexpected ways. If a user shows interest in astronomy, suggest a podcast on the philosophy of time travel.
    
    User Profile:
    ${history}

    Generate content that will make the user feel understood and inspired. The first item should be a 'serendipity' piece – something that feels perfectly, almost magically, timed for them.
    Do not repeat topics from their recent history unless you are presenting a much deeper or different angle.
    
    CRITICAL INSTRUCTION: Adhere strictly to the following content distribution. The user heavily prefers visual content.
    - 'video' type: ~90% of the content (around 7 items).
    - 'quote' or 'simulation' types (image-based): ~9% of the content (around 1 item).
    - 'article' or 'podcast' types: ~1% of the content (0 items, or 1 at most if highly relevant).
  `;
}

// Helper to generate mock article text
const generateMockArticle = (title: string) => {
    return `
        <p>Introduction to ${title}:
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede.</p>
        <img src="https://picsum.photos/seed/${encodeURIComponent(title)}/600/300" alt="Related image for ${title}" class="rounded-lg my-4" />
        <p>Deeper Dive:
        Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam. Proin magna.</p>
        
        <p>Exploring Nuances of ${title}:
        Nulla congue, elit vel rhoncus malesuada, tellus magna vehicula tellus, vel mattis neque enim sed eros. Sed sed risus at mi blandit viverra. Praesent accumsan, est ac interdum convallis, odio magna scelerisque lacus, ac feugiat libero massa et felis.</p>
        
        <pre class="bg-gray-100 dark:bg-gray-700 p-4 rounded-md text-sm my-4"><code>// Code example related to ${title}
function concept() {
    return "exploration";
}</code></pre>

        <p>Further Considerations:
        Vestibulum sed ante. Donec sagittis euismod purus. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
        
        <p>Conclusion on ${title}:
        Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>
    `.repeat(3); // Make it long enough for meaningful scrolling
}


export async function generateContentForUser(profile: UserProfile): Promise<ContentItem[]> {
  const prompt = constructPrompt(profile);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: contentSchema,
      },
    });

    const jsonText = response.text.trim();
    const generatedItems = JSON.parse(jsonText) as any[];

    return generatedItems.map((item, index) => {
        const contentItem: ContentItem = {
            id: `${Date.now()}-${index}`,
            type: item.type,
            title: item.title,
            description: item.description,
            tags: item.tags || [],
            imageUrl: `https://picsum.photos/seed/${encodeURIComponent(item.imageQuery)}/600/400`,
            isLiked: false,
        };

        if(contentItem.type === 'article') {
            contentItem.content = generateMockArticle(item.title);
        }

        if(contentItem.type === 'video') {
            // Using a placeholder video for demonstration
            contentItem.videoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
        }

        return contentItem;
    });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Fallback to some default content in case of API error
    return [
      { id: 'fallback-1', type: 'article', title: 'The Beauty of the Cosmos', description: 'An error occurred while fetching personalized content. Explore this article about space in the meantime.', tags: ['space', 'science'], imageUrl: 'https://picsum.photos/seed/cosmos/600/400', isLiked: false, content: generateMockArticle('The Beauty of the Cosmos') }
    ];
  }
}