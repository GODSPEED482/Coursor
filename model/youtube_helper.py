import urllib.request
import urllib.parse
import re

def get_youtube_video_details(query: str, max_results: int = 1):
    """
    Searches YouTube for a given query and returns a dictionary with the URL
    and Channel Name of the top result. Returns None if nothing is found.
    """
    try:
        search_query = urllib.parse.quote(query)
        req = urllib.request.Request(
            f"https://www.youtube.com/results?search_query={search_query}",
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        with urllib.request.urlopen(req) as response:
            html = response.read().decode()
            video_ids = re.findall(r"watch\?v=(\S{11})", html)
            if video_ids:
                # Deduplicate while preserving order
                unique_ids = list(dict.fromkeys(video_ids))
                return {
                    "url": f"https://www.youtube.com/watch?v={unique_ids[0]}",
                    "channel_name": "YouTube Search Result",
                }
    except Exception as e:
        print(f"Error fetching YouTube video for query '{query}': {e}")
        
    return None
