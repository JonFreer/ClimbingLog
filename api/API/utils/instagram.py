import requests
import time

API_VERSION = 'v21.0'


def create_reel_container(access_token, ig_user_id, video_url):
    url = f'https://graph.instagram.com/{API_VERSION}/{ig_user_id}/media'
    params = {
        'access_token': access_token,
        'media_type': 'REELS',
        'video_url': video_url,
        'caption': 'Check out my new reel!'  # Optional
    }
    response = requests.post(url, params=params)
    response.raise_for_status()
    return response.json()['id']


def wait_until_ready(access_token, container_id, timeout=300, poll_interval=15):
    url = f'https://graph.instagram.com/{API_VERSION}/{container_id}'
    params = {
        'fields': 'status_code',
        'access_token': access_token
    }

    elapsed = 0
    while elapsed < timeout:
        response = requests.get(url, params=params)
        response.raise_for_status()
        status = response.json().get('status_code')
        print(f"Container status: {status}")
        if status == 'FINISHED':
            return
        elif status in ['ERROR', 'EXPIRED']:
            raise Exception(f"Upload failed with status: {status}")
        time.sleep(poll_interval)
        elapsed += poll_interval
    raise TimeoutError("Timeout waiting for container to be ready.")


def publish_reel(access_token, ig_user_id, container_id):
    url = f'https://graph.instagram.com/{API_VERSION}/{ig_user_id}/media_publish'
    params = {
        'access_token': access_token,
        'creation_id': container_id
    }
    response = requests.post(url, params=params)
    response.raise_for_status()
    return response.json()['id']


def post_reel_from_url(access_token, ig_user_id, video_url):
    print("Creating reel container from hosted URL...")
    container_id = create_reel_container(access_token, ig_user_id, video_url)
    print("Waiting for container to be ready...")
    wait_until_ready(access_token, container_id)
    print("Publishing reel...")
    media_id = publish_reel(access_token, ig_user_id, container_id)
    print(f"Reel published successfully! Media ID: {media_id}")
    return media_id


# if __name__ == '__main__':
#     post_reel_from_url(ACCESS_TOKEN, IG_USER_ID, VIDEO_URL)
