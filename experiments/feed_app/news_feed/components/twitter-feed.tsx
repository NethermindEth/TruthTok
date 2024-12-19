'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Repeat2 } from 'lucide-react'
import YouTubeEmbed from './youtube-embed'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import { Chatbot } from './chatbot'

interface Tweet {
  id: number
  content: string
  user_name: string
  user_username: string
  user_avatar: string
  likes: number
  retweets: number
  replies: number
  timestamp: string
}

export default function TwitterFeed() {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [newTweet, setNewTweet] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTweets()
  }, [])

  const fetchTweets = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:8000/tweets/')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setTweets(data)
    } catch (error) {
      console.error('Error fetching tweets:', error)
      setError('Failed to fetch tweets. Please ensure the server is running and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewTweet = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newTweet.trim()) {
      setError(null)
      const tweet = {
        content: newTweet,
        user_name: "Current User",
        user_username: "currentuser",
        user_avatar: "/placeholder.svg?height=40&width=40"
      }

      try {
        const response = await fetch('http://localhost:8000/tweets/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tweet),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        setNewTweet("")
        fetchTweets()
      } catch (error) {
        console.error('Error posting tweet:', error)
        setError('Failed to post tweet. Please try again.')
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-2xl font-bold">Chatbot</h2>
        </CardHeader>
        <CardContent className="p-4">
          <Chatbot />
        </CardContent>
      </Card>
      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-2xl font-bold">Post a Tweet</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNewTweet}>
            <Input
              placeholder="What's happening? (You can include YouTube links!)"
              value={newTweet}
              onChange={(e) => setNewTweet(e.target.value)}
              className="mb-2"
            />
            <Button type="submit">Tweet</Button>
          </form>
        </CardContent>
      </Card>
      {isLoading ? (
        <p>Loading tweets...</p>
      ) : tweets.length > 0 ? (
        tweets.map((tweet) => (
          <Card key={tweet.id} className="mb-4">
            <CardHeader>
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-2">
                  <AvatarImage src={tweet.user_avatar} alt={tweet.user_name} />
                  <AvatarFallback>{tweet.user_name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{tweet.user_name}</p>
                  <p className="text-sm text-gray-500">@{tweet.user_username}</p>
                </div>
                <p className="ml-auto text-sm text-gray-500">{new Date(tweet.timestamp).toLocaleString()}</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{tweet.content}</p>
              <YouTubeEmbed content={tweet.content} />
            </CardContent>
            <CardFooter>
              <div className="flex justify-between w-full">
                <Button variant="ghost" size="sm">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {tweet.replies}
                </Button>
                <Button variant="ghost" size="sm">
                  <Repeat2 className="mr-2 h-4 w-4" />
                  {tweet.retweets}
                </Button>
                <Button variant="ghost" size="sm">
                  <Heart className="mr-2 h-4 w-4" />
                  {tweet.likes}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))
      ) : (
        <p>No tweets found. Be the first to tweet!</p>
      )}
    </div>
  )
}
