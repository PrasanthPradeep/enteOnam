import { useState, useEffect } from 'react'
import { Calendar, Clock, Flower, Star, Crown, Gift } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'

const rituals = [
  { 
    day: 'Atham', 
    desc: 'Start of Onam season. Pookalam begins.',
    icon: Flower,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  { 
    day: 'Chithira', 
    desc: 'Second layer added to pookalam.',
    icon: Star,
    color: 'text-gold-600',
    bgColor: 'bg-gold-50'
  },
  { 
    day: 'Chodhi', 
    desc: 'Shopping for new clothes begins.',
    icon: Gift,
    color: 'text-terracotta-600',
    bgColor: 'bg-terracotta-50'
  },
  { 
    day: 'Vishakam', 
    desc: 'Markets get busy. Sweets prepared.',
    icon: Star,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  { 
    day: 'Anizham', 
    desc: 'Vallamkali (boat race) practice starts.',
    icon: Crown,
    color: 'text-gold-600',
    bgColor: 'bg-gold-50'
  },
  { 
    day: 'Thriketa', 
    desc: 'Grand pookalam. Family gatherings begin.',
    icon: Flower,
    color: 'text-terracotta-600',
    bgColor: 'bg-terracotta-50'
  },
  { 
    day: 'Moolam', 
    desc: 'Feasts in temples. Onam sadya served.',
    icon: Star,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  { 
    day: 'Pooradam', 
    desc: 'Small conical clay idols (Onathappan) placed.',
    icon: Crown,
    color: 'text-gold-600',
    bgColor: 'bg-gold-50'
  },
  { 
    day: 'Uthradam', 
    desc: 'Final shopping day. Family arrivals.',
    icon: Gift,
    color: 'text-terracotta-600',
    bgColor: 'bg-terracotta-50'
  },
  { 
    day: 'Thiruvonam', 
    desc: 'Main Onam day. Grand sadya, festivities.',
    icon: Crown,
    color: 'text-gold-600',
    bgColor: 'bg-gold-50',
    isMainDay: true
  },
]

export default function CountdownView() {
  const [daysLeft, setDaysLeft] = useState(0)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const target = new Date('2026-08-26T00:00:00')
    
    const updateCountdown = () => {
      const now = new Date()
      const difference = target.getTime() - now.getTime()
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)
        
        setDaysLeft(days)
        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setDaysLeft(0)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-8">
      {/* Hero Section with Countdown */}
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-green-800 flex items-center justify-center gap-3">
            <Flower className="h-8 w-8 md:h-12 md:w-12 text-gold" />
            ഓണം 2026
            <Flower className="h-8 w-8 md:h-12 md:w-12 text-gold" />
          </h1>
          <p className="text-lg text-muted-foreground">
            Kerala's grand festival of harvest, homecoming, and happiness
          </p>
        </div>

        {/* Countdown Timer */}
        <Card className="festival-card max-w-2xl mx-auto">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Clock className="h-6 w-6 text-gold" />
              {daysLeft > 0 ? 'Thiruvonam Countdown' : 'Onam Ashamsakal! 🎉'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {daysLeft > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-green-600">
                    {timeLeft.days}
                  </div>
                  <div className="text-sm text-muted-foreground">Days</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gold">
                    {timeLeft.hours}
                  </div>
                  <div className="text-sm text-muted-foreground">Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-terracotta">
                    {timeLeft.minutes}
                  </div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-green-600">
                    {timeLeft.seconds}
                  </div>
                  <div className="text-sm text-muted-foreground">Seconds</div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-6xl">🎊</div>
                <p className="text-xl text-green-600 font-semibold">
                  Thiruvonam is here! Celebrate with joy!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Onam Days & Rituals */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-green-800 mb-2">Ten Days of Onam</h2>
          <p className="text-muted-foreground">
            Each day brings unique traditions and rituals leading to the grand celebration
          </p>
        </div>

        <div className="grid gap-4 md:gap-6">
          {rituals.map((ritual, index) => {
            const Icon = ritual.icon
            return (
              <Card 
                key={ritual.day} 
                className={`festival-card hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${
                  ritual.isMainDay ? 'ring-2 ring-gold border-gold' : ''
                }`}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  {/* Day Counter */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full ${ritual.bgColor} flex items-center justify-center`}>
                    <span className="text-sm font-bold text-green-800">
                      {index + 1}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className={`flex-shrink-0 p-3 rounded-lg ${ritual.bgColor}`}>
                    <Icon className={`h-6 w-6 ${ritual.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-bold text-lg ${ritual.color}`}>
                        {ritual.day}
                      </h3>
                      {ritual.isMainDay && (
                        <Crown className="h-4 w-4 text-gold animate-pulse" />
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {ritual.desc}
                    </p>
                  </div>

                  {/* Special indicator for main day */}
                  {ritual.isMainDay && (
                    <div className="flex-shrink-0">
                      <div className="bg-gold text-white px-3 py-1 rounded-full text-xs font-medium">
                        Main Day
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Call to Action */}
      <Card className="festival-card text-center">
        <CardContent className="py-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-green-800">Ready to Celebrate?</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Explore our features to find nearby stores, plan your Onam sadya, 
              discover celebration spots, and more!
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild variant="default" className="flex items-center gap-2">
                <a href="./sadya">
                  <Calendar className="h-4 w-4" />
                  Plan Sadya
                </a>
              </Button>
              <Button asChild variant="secondary" className="flex items-center gap-2">
                <a href="./stores">
                  <Gift className="h-4 w-4" />
                  Find Stores
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
