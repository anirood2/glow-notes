/* ═══════════════════════════════════════
   GLOW NOTES — data.js
   Human voice. No dashes. No AI tells.
═══════════════════════════════════════ */

const FEATURED_IDS = [
  'proud-of-you',
  'storm-will-pass',
  'you-are-enough',
  'the-leap',
  'your-light',
  'broken-open',
  'look-at-you',
  'start-here'
];

const DEFAULT_REELS = [

  // ── HOPEFUL ──────────────────────────────────────────

  {
    id: 'proud-of-you',
    tag: 'A Letter to You',
    title: "I'm <span class='glow-word'>Proud</span> of You",
    body: [
      "I want you to know something, and I need you to actually let it land: I am so proud of you. Not for any one thing. For all of it. For the way you kept showing up even when no one was watching and nothing felt like it was working.",
      "You've been carrying more than most people would know how to hold. And you didn't do it perfectly. You stumbled. You had the bad days. But you kept going, and that matters more than you're letting yourself believe right now.",
      "I've watched you grow in ways you probably can't even see yet. You're <span class='glow-word'>steadier</span> than you used to be. Softer in the right places. Tougher where it counts. That didn't happen by accident.",
      "So on the days when it all feels like too much, I hope you remember this moment. Someone who knows you, really knows you, looked at everything you've been through and felt nothing but <span class='glow-word'>pride</span>."
    ],
    signature: "Deeply, completely, proud of you.",
    mood: 'hopeful', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'new-chapter',
    tag: 'A New Beginning',
    title: "This Is Your <span class='glow-word'>New Chapter</span>",
    body: [
      "Something is shifting for you. I know it might not feel that clean or that clear from where you're standing. Change rarely does. But it's happening, and I think some part of you already knows it.",
      "You're not who you were a year ago. Not even close. And that's not a small thing. Most people stay the same because change is uncomfortable and familiar is easier. You chose something harder.",
      "Whatever comes next, you're walking into it with something you didn't have before. <span class='glow-word'>Experience</span>. A little more scar tissue. A better sense of what you can actually handle, which turns out to be quite a lot.",
      "This chapter is yours. Write it the way you want. You've earned the right to do that."
    ],
    signature: "The best pages are still ahead of you.",
    mood: 'hopeful', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'seeds-growing',
    tag: 'For the Patient Ones',
    title: "It's <span class='glow-word'>Working</span> Even When You Can't See It",
    body: [
      "I know it doesn't feel like anything is happening. That's the hardest part of doing the right things consistently and not seeing results yet. It feels like you're just spinning your wheels in the dark.",
      "But here's what I know about you. You've been putting in real work. Real effort. The kind that doesn't make for a good photo or a satisfying update to share with anyone. The unglamorous, daily kind.",
      "That work doesn't disappear. It <span class='glow-word'>accumulates</span>. It builds under the surface in ways you can't track. And at some point, usually when you least expect it, something breaks through.",
      "You're closer than you think. Please don't stop now."
    ],
    signature: "Keep going. It's working.",
    mood: 'hopeful', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'you-are-allowed',
    tag: 'Permission Slip',
    title: "You Are <span class='glow-word'>Allowed</span> to Want More",
    body: [
      "Can I tell you something no one says enough? You're allowed to want a bigger life than the one you have right now. That's not ungrateful. That's not selfish. That's just being honest with yourself about who you are.",
      "You're allowed to outgrow places and people that no longer fit. You're allowed to change your mind about what matters. You're allowed to start over, even when starting over is embarrassing or inconvenient or hard to explain.",
      "Nobody gets to decide the size of your life for you. Not the people who knew you before. Not the voice in your head that keeps asking if you're being realistic. <span class='glow-word'>You get to decide</span>.",
      "So decide. Then go."
    ],
    signature: "You don't need anyone's permission. Just your own.",
    mood: 'hopeful', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'almost-there',
    tag: 'Keep Going',
    title: "You Are So Much <span class='glow-word'>Closer</span> Than You Feel",
    body: [
      "The middle of something hard is the worst place to try to measure your progress. Everything looks flat from there. The start feels far away and the end feels further. That's just what the middle feels like. It lies.",
      "You haven't plateaued. You haven't lost it. You're just in the part that doesn't have a highlight reel. The part where the only thing you can do is keep putting one foot in front of the other and trust that it's adding up.",
      "It's adding up. I promise you, <span class='glow-word'>it's adding up</span>.",
      "Don't quit in the middle of your own story."
    ],
    signature: "The finish line is real. Keep running toward it.",
    mood: 'hopeful', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'future-self',
    tag: 'From the Other Side',
    title: "Your Future Self Is <span class='glow-word'>Rooting</span> for You",
    body: [
      "I want you to imagine, just for a second, the version of you that's on the other side of all this. The one who got through it. Who figured it out, not perfectly, but genuinely. Who looks back at this exact moment you're in right now.",
      "That version of you isn't looking back with regret. They're looking back with something that feels a lot like <span class='glow-word'>gratitude</span>. Grateful you didn't give up here. Grateful you kept going even when you couldn't see why.",
      "You're going to get there. Not because everything is going to magically work out, but because you're the kind of person who finds a way. You've done it before. You're doing it now, even if it doesn't feel like it.",
      "Your future self is rooting for you so hard right now."
    ],
    signature: "Keep going. They're waiting for you on the other side.",
    mood: 'hopeful', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'small-joys',
    tag: 'The Little Things',
    title: "Let the <span class='glow-word'>Good Moments</span> In",
    body: [
      "I know things have been heavy. And I'm not going to tell you to just look on the bright side, because that's not how it works and you deserve better than that kind of advice.",
      "But I do want to ask you something. Are you letting the small good things in? The coffee that was exactly right. The song that showed up at the perfect moment. The brief, unexpected feeling that maybe things are going to be okay.",
      "Those moments aren't meaningless just because the bigger picture is hard. They're actually proof that <span class='glow-word'>beauty is still happening</span>, even now, even around all of this.",
      "Let them count. You're allowed to feel both things at once."
    ],
    signature: "The small joys are still real. Let them reach you.",
    mood: 'hopeful', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  // ── STRENGTH ─────────────────────────────────────────

  {
    id: 'you-are-enough',
    tag: 'A Gentle Reminder',
    title: "You Are <span class='glow-word'>Enough</span>",
    body: [
      "I know you don't feel it right now. I know the gap between who you are and who you think you're supposed to be feels enormous. But I need you to hear this from someone who isn't inside your head: you are enough. Right now. As you are.",
      "Not the future version of you that has it together. Not the version that's finally lost the weight or landed the job or figured out the relationship. <span class='glow-word'>This version</span>. The one reading this, tired and uncertain and still trying.",
      "You've survived every hard day that's come before this one. Every single one. That's not luck. That's something in you that refuses to give up, even when you consciously want to.",
      "That thing in you? That's enough. More than enough."
    ],
    signature: "You already are what you're looking for.",
    mood: 'strength', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'built-different',
    tag: 'You Were Made for This',
    title: "You Are <span class='glow-word'>Harder to Break</span> Than You Think",
    body: [
      "Here's what I've noticed about you. When things get hard, you adapt. You find a way. You don't always do it gracefully, and you'd probably be the last person to call it strength, but that's exactly what it is.",
      "What you've been through would have derailed a lot of people. Not because they're weaker, just because they haven't had to build what you've built. You've been forged in fires that most people never have to walk through.",
      "That shows up in you. In the way you handle pressure. In the way you know, on some cellular level, that you've gotten through worse than this. In the quiet <span class='glow-word'>certainty</span> that you'll get through this too.",
      "You're harder to break than you think. I've seen the proof."
    ],
    signature: "You were built for exactly this.",
    mood: 'strength', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'rise-again',
    tag: 'For the Ones Who Fall',
    title: "Getting Back Up Is the <span class='glow-word'>Whole Thing</span>",
    body: [
      "You fell. Okay. That happened. And I'm not going to pretend it didn't or tell you it wasn't as bad as it felt, because you were there and I wasn't and you know what it cost you.",
      "But here's the thing about falling. Everyone does it. The only variable is what happens next. And you're already doing the thing. You're already getting back up. Maybe slowly. Maybe messily. But you're doing it.",
      "That's the whole game, honestly. Not never falling. <span class='glow-word'>Getting back up</span>. That's the only move that actually matters, and you're making it right now.",
      "I'm in your corner. I've always been in your corner."
    ],
    signature: "Get up one more time. That's all it ever takes.",
    mood: 'strength', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'warrior-quiet',
    tag: 'The Quiet Fight',
    title: "I See the <span class='glow-word'>Battle</span> You're Fighting",
    body: [
      "Nobody talks about the kind of strength it takes to hold yourself together when everything inside you is coming apart. The kind that doesn't look like anything from the outside. The kind where you just show up and function and nobody knows what it cost you to do that.",
      "That's the kind of strength you've been carrying. Every day. And I see it. Even if nobody else does. Even if you can't see it yourself right now.",
      "You're not just surviving this. You're doing it without making it anyone else's problem. Without falling apart in public. Without asking for things you probably deserve to ask for. That's <span class='glow-word'>extraordinary</span>, even if it doesn't feel like it.",
      "I see you. All of it. And I'm in awe."
    ],
    signature: "The bravest battles are the ones no one else sees.",
    mood: 'strength', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'still-here',
    tag: 'Survival Is Enough',
    title: "The Fact That You're <span class='glow-word'>Still Here</span> Matters",
    body: [
      "I don't know everything you've been through. You probably haven't told anyone everything. But I know enough to say this: the fact that you're still here, still trying, still reaching for something better, that is not a small thing.",
      "There were days when staying was the hardest possible choice. When giving up on something, a dream, a hope, a version of yourself, would have been so much easier. But you didn't.",
      "You stayed. And everything that's still possible for you, it's only possible because you <span class='glow-word'>stayed</span>.",
      "Thank you for staying."
    ],
    signature: "The next chapter needs you in it.",
    mood: 'strength', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  // ── COMFORT ──────────────────────────────────────────

  {
    id: 'your-light',
    tag: 'For the Quiet Ones',
    title: "Your <span class='glow-word'>Light</span> Is Real",
    body: [
      "You probably don't think about the effect you have on people. That's kind of the thing about you. You're not performing kindness or warmth. You just are those things, naturally, without making a big deal of it.",
      "But people feel it. The room feels different when you're in it. Conversations go somewhere real when you're part of them. People say things to you they don't say to anyone else, because something about you makes it feel safe to be honest.",
      "That's a rare thing. Genuinely rare. And it matters more than you're giving yourself credit for. Your <span class='glow-word'>presence</span> is a gift, even on the days when you feel like you have nothing to offer.",
      "Don't ever let anyone talk you out of that softness. It's one of the best things about you."
    ],
    signature: "Your light reaches further than you know.",
    mood: 'comfort', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'storm-will-pass',
    tag: 'When It Gets Heavy',
    title: "This Is Not <span class='glow-word'>Forever</span>",
    body: [
      "Right now it feels like it will always feel like this. That's one of the cruelest things about pain. It colonizes your sense of time and makes you feel like the present is permanent. It isn't.",
      "I know that's not the kind of thing you can just decide to believe. It has to be earned. But I need you to hold onto it anyway, even if you can't fully feel it yet. This is not your final destination. This is a season.",
      "You don't have to be strong right now. You don't have to have a plan. You just have to get through today, and then tomorrow, and let the storm do what storms do, which is <span class='glow-word'>pass</span>.",
      "And when it does, and I promise you it will, you'll still be standing. You always are."
    ],
    signature: "After every storm, there is stillness. Yours is coming.",
    mood: 'comfort', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'not-alone',
    tag: 'You Are Seen',
    title: "You Don't Have to <span class='glow-word'>Carry This Alone</span>",
    body: [
      "I know you've been trying to handle this by yourself. I know you don't want to be a burden. I know it feels easier sometimes to just quietly carry it rather than put it down somewhere someone else has to help you pick it up.",
      "But I want you to know something. Letting people in isn't weakness. It's actually one of the harder things to do. And the people who love you, they want to be let in. They'd rather know the real thing than the polished version.",
      "You are not alone in this. You might feel alone, but feeling and being are very different things. There are people in your corner who <span class='glow-word'>want to show up</span> for you the way you've shown up for everyone else.",
      "Let them. You've earned that."
    ],
    signature: "You were never meant to carry all of this alone.",
    mood: 'comfort', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'permission-to-rest',
    tag: 'Rest Is Not Quitting',
    title: "You Are <span class='glow-word'>Allowed</span> to Rest",
    body: [
      "You've been going for a long time. Not just today. For months, maybe longer. Pushing through things you should have probably stopped for. Keeping up with a pace that was never sustainable, because stopping felt like giving up.",
      "It's not giving up. Resting is not quitting. Your body knows this. Your mind knows it too, even if the part of you that runs on willpower refuses to listen.",
      "You need to stop. Not forever. Just long enough to <span class='glow-word'>refill</span>. Long enough to remember what you actually like. Long enough to sleep without the weight of everything sitting on your chest.",
      "You cannot pour from empty. And you've been running on fumes for too long."
    ],
    signature: "Rest now. The work will still be there when you come back.",
    mood: 'comfort', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'tender-heart',
    tag: 'For the Ones Who Feel Everything',
    title: "Your <span class='glow-word'>Big Heart</span> Is Not a Flaw",
    body: [
      "The world isn't always kind to people who feel things deeply. You probably know that better than most. You feel things that other people brush right past. You carry things that other people set down without thinking twice.",
      "That's exhausting sometimes, I know. But it's also what makes you who you are. It's why people come to you when things are real. Why they trust you with the things they can't say to anyone else.",
      "Your sensitivity isn't a design flaw. It's a <span class='glow-word'>design feature</span>. The world needs people who still feel things, who haven't numbed out, who refuse to stop caring even when caring costs something.",
      "Don't let anyone convince you to be less. Please don't."
    ],
    signature: "Feeling everything is a strength. Don't let them tell you otherwise.",
    mood: 'comfort', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'heavy-days',
    tag: 'On the Hard Days',
    title: "Getting Through Today <span class='glow-word'>Is Enough</span>",
    body: [
      "Some days the goal isn't to thrive. Some days the goal is just to get through. And if that's where you are right now, I want you to know that's okay. More than okay. That takes everything you have on certain days.",
      "Getting out of bed was something. Eating was something. Answering that one message you'd been avoiding was something. Those things count. They count even if nobody saw them. They count even if they don't feel like accomplishments.",
      "<span class='glow-word'>You showed up today</span>. In whatever small way you could. That's not nothing. That's actually the whole thing on a day like this.",
      "Tomorrow you don't have to be better. Just here. Just try to be here."
    ],
    signature: "Today was enough. You are enough. Rest now.",
    mood: 'comfort', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'who-you-are',
    tag: 'A Truth About You',
    title: "You Are Not Your <span class='glow-word'>Hardest Season</span>",
    body: [
      "I need you to stop letting this hard season define you. You are not your worst days. You are not the version of yourself that doubt built at 2 in the morning when you were exhausted and scared and couldn't see a way forward.",
      "You are the person who kept going anyway. Who called the friend. Who tried again. Who, despite having every reason to give up on yourself, hasn't. That's who you actually are.",
      "The hard season will end. But <span class='glow-word'>you'll still be you</span> when it does. You'll still have everything you've learned. Everything you've built inside yourself by surviving this.",
      "That's worth something. That's worth a lot."
    ],
    signature: "You are so much more than this hard chapter.",
    mood: 'comfort', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  // ── CELEBRATION ──────────────────────────────────────

  {
    id: 'look-at-you',
    tag: 'A Toast to You',
    title: "Look at <span class='glow-word'>What You Did</span>",
    body: [
      "Stop for a second. Actually stop. Look at what you just did. Not through the lens of what's next or what still needs to happen or how far there still is to go. Just look at this. Right here. What you made happen.",
      "Do you remember when this felt impossible? When you genuinely weren't sure if you had it in you? You showed up anyway. You did the work. You pushed through the moments where quitting would have been completely understandable.",
      "And you <span class='glow-word'>made it happen</span>. That's not luck. That's not circumstance. That's you.",
      "Take the credit. You've earned it completely."
    ],
    signature: "Take the bow. You built this.",
    mood: 'celebration', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'milestone',
    tag: 'Marking the Moment',
    title: "Stop and <span class='glow-word'>Feel This</span>",
    body: [
      "We're so bad at celebrating ourselves. We hit a goal and immediately we're already looking at the next one. Already thinking about what's left, what's next, what still needs to happen. We skip right past the moment.",
      "I'm asking you not to do that this time. I'm asking you to actually stop and feel this. Let it land. Let yourself be proud. Let yourself be happy about what you've done without immediately qualifying it or minimizing it.",
      "The version of you from a year ago would look at where you are right now and feel <span class='glow-word'>stunned</span>. Would feel emotional. Would barely believe it.",
      "Be that person for yourself right now. You deserve that moment."
    ],
    signature: "This is yours. Let yourself have it.",
    mood: 'celebration', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'how-far',
    tag: 'Look How Far',
    title: "Remember <span class='glow-word'>Where You Started</span>",
    body: [
      "Go back for a second. Not to dwell there, just to see it clearly. Remember where you started. The uncertainty you were carrying. The way you weren't sure if any of it would work. The version of you who had no roadmap and started anyway.",
      "That person made this possible. Every hard decision. Every time they chose the uncomfortable path over the easy one. Every time they got up and kept going when stopping was the more appealing option.",
      "You are so far from where you started. <span class='glow-word'>So far</span>. And you did that.",
      "Let yourself be proud. Loudly and completely. You've earned it."
    ],
    signature: "Look how far. Look how far you've come.",
    mood: 'celebration', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  // ── HEALING ──────────────────────────────────────────

  {
    id: 'grief-honored',
    tag: 'For the Ones Who Are Hurting',
    title: "Your Grief <span class='glow-word'>Makes Sense</span>",
    body: [
      "You don't have to be over it yet. I want to say that first because I know there's probably a part of you that thinks you should be further along by now, that thinks you're taking too long, that is impatient with yourself for still feeling this.",
      "But grief doesn't work on a schedule. It works on its own terms. And trying to rush it or suppress it or get to the other side before you're ready just means it waits for you. It always waits.",
      "What you lost mattered. The pain you feel is <span class='glow-word'>proportional to how much it mattered</span>. That's not weakness. That's love, doing what love does when something is taken from it.",
      "Grieve as long as you need to. I'll be here when you come up for air."
    ],
    signature: "Your grief is the measure of how much you loved.",
    mood: 'grief', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'still-healing',
    tag: 'The Long Road',
    title: "Healing Looks Like <span class='glow-word'>This</span>",
    body: [
      "Can I be honest with you about something? Healing doesn't look like a clean upward line. It's not a montage. It's not a before and after. It's two steps forward and one step back and a random Tuesday where you feel completely fine followed by a Wednesday that knocks you flat.",
      "That's not failure. That's just what healing actually looks like when it's real. When you're doing the actual work of it, not just performing recovery for other people.",
      "You're doing the real work. I can see it. And the fact that some days are still hard doesn't mean you aren't <span class='glow-word'>getting better</span>. It just means it's not finished yet. That's okay.",
      "Keep going. You're healing even on the days it doesn't feel like it."
    ],
    signature: "You're healing. Even now. Even today.",
    mood: 'grief', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'carried-too-long',
    tag: 'Put It Down',
    title: "You've Been Carrying This <span class='glow-word'>Too Long</span>",
    body: [
      "There's something you've been holding. Maybe for years. Guilt that was never fully yours to carry. Shame that someone else handed you and you accepted because you didn't know yet that you had a choice. Expectations that were never realistic to begin with.",
      "You've been good about it. Carrying it quietly. Not complaining. Getting on with things. But I've watched it get heavier. And I think part of you knows it's time.",
      "You're allowed to put it down. You don't need a ceremony or a reason or anyone's permission. You can just <span class='glow-word'>decide</span> that you're done carrying it. That it doesn't get to come with you into what's next.",
      "Set it down. Walk forward without it. See how different that feels."
    ],
    signature: "You can put it down. You've carried it long enough.",
    mood: 'grief', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'broken-open',
    tag: 'On the Other Side of Pain',
    title: "This Broke You <span class='glow-word'>Open</span>, Not Apart",
    body: [
      "What happened to you was real. I'm not going to minimize it or wrap it in language that makes it sound like it was supposed to happen or that everything happens for a reason. Sometimes things just hurt and that's the whole story.",
      "But I've watched what's happened to you since. And I want you to see something you might be missing. You didn't close off. Most people do, after something like this. They protect themselves by becoming smaller, harder, less available to the world.",
      "You did something different. You stayed <span class='glow-word'>open</span>. Softer in some ways than before. More honest. More present. More yourself somehow, even through all of it.",
      "The pain broke you open. It didn't break you. Those are very different things."
    ],
    signature: "You came through it more yourself than before.",
    mood: 'grief', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  // ── COURAGE ──────────────────────────────────────────

  {
    id: 'start-here',
    tag: 'A New Beginning',
    title: "Start <span class='glow-word'>Here</span>",
    body: [
      "You've been waiting for the right moment. The right circumstances. The right version of yourself to show up before you begin. I understand that impulse. But I also need to tell you something: that moment is not coming.",
      "There is no version of the future where everything is lined up perfectly and the risk feels manageable and the timing is ideal. That's not how any of this works. The people who start are the ones who start when it's messy and uncertain and not quite right.",
      "You don't need more preparation. You don't need more time. You need to take the first step and <span class='glow-word'>let the rest follow</span>.",
      "Start here. Start now. Start as you are."
    ],
    signature: "The best time to begin is right now.",
    mood: 'courage', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'the-leap',
    tag: 'For the Ones on the Edge',
    title: "You're <span class='glow-word'>Ready</span>",
    body: [
      "I know you don't feel ready. That's actually part of why I know you are. The people who feel completely ready before they begin are the ones who aren't challenging themselves enough. Real leaps never feel perfectly safe before you take them.",
      "You've done the thinking. You've done the preparation. You've asked the questions and weighed the risks and talked yourself in and out of it more times than you can count. At some point, more thinking stops being useful.",
      "This is that point. Everything you need is already inside you. The rest of it, the confidence, the clarity, the certainty, those things come <span class='glow-word'>after</span> the leap, not before.",
      "Jump. I believe in you completely."
    ],
    signature: "The net appears when you jump. I've seen it happen.",
    mood: 'courage', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'brave-enough',
    tag: 'On Being Brave',
    title: "You Are <span class='glow-word'>Braver</span> Than You Think",
    body: [
      "Brave doesn't look like what you think it looks like. It's not the absence of fear. It's not the dramatic moment where everything is clear and you step forward with confidence. Most of the time, brave looks a lot like terrified but doing it anyway.",
      "You've done that. More times than you're giving yourself credit for. You've walked into rooms that scared you. You've said the things that were hard to say. You've kept going when stopping felt like the only reasonable option.",
      "That's courage. That messy, imperfect, shaking hands but doing it anyway version of it. That's the real thing. And you have <span class='glow-word'>more of it than you know</span>.",
      "Trust yourself on this one."
    ],
    signature: "You're braver than you feel. I've watched you prove it.",
    mood: 'courage', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'your-voice',
    tag: 'Speak Up',
    title: "Your Voice <span class='glow-word'>Matters</span>",
    body: [
      "You've been quieter than you should be. I think you know that. You've been holding back the thing you actually think, the honest version of what you feel, because you weren't sure if it was worth saying or if anyone would listen.",
      "It's worth saying. And the right people will listen. Not everyone will, and that's okay, but the ones who matter will. The ones who are waiting for exactly that kind of honesty, the unpolished, real, this-is-actually-what-I-think version.",
      "Your perspective on things is <span class='glow-word'>specific to you</span>. Nobody else has exactly your angle. Nobody else has lived the exact combination of things you've lived. That makes what you have to say genuinely irreplaceable.",
      "So say it. The world needs to hear from you."
    ],
    signature: "Say the thing. The right people are waiting for it.",
    mood: 'courage', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'say-yes',
    tag: 'The Open Door',
    title: "Say <span class='glow-word'>Yes</span>",
    body: [
      "There's a door open in front of you. Maybe it's been there for a while and you've been circling it, looking at it from different angles, wondering if you're the right person for whatever is on the other side.",
      "Here's what I want to ask you. What would you do if you weren't afraid that you'd get there and find out you weren't enough? Because I think you know the answer. I think you'd walk right through.",
      "So walk through. Not because you're certain. Not because the fear is gone. But because <span class='glow-word'>the door is open</span> and you're the one standing in front of it and that is not an accident.",
      "Say yes. Figure out the rest after."
    ],
    signature: "Yes is where your next life begins.",
    mood: 'courage', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  // ── UNIVERSAL ────────────────────────────────────────

  {
    id: 'imperfect-beautiful',
    tag: 'For the Imperfect Ones',
    title: "You Don't Have to <span class='glow-word'>Have It Together</span>",
    body: [
      "Nobody actually has it together the way it looks from the outside. The people who seem like they do are just better at not showing you the parts that are falling apart. Everyone has those parts.",
      "You're not behind. You're not doing life wrong. You're doing it in real time, with real limitations, as a real person who is figuring things out as they go. That's all any of us are doing.",
      "The imperfect, figuring-it-out version of you is still <span class='glow-word'>completely worth knowing</span>. Worth loving. Worth showing up for. You don't have to earn that by getting yourself sorted first.",
      "You're enough right now. Messy and uncertain and whole."
    ],
    signature: "The cracks are where the light gets through.",
    mood: 'comfort', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'enough-for-today',
    tag: 'Just Today',
    title: "Just <span class='glow-word'>Today</span>",
    body: [
      "You don't have to solve everything right now. You don't have to have a plan for the next year or even the next month. You just have to get through today. That's it. That's the whole assignment.",
      "And not perfectly. Just through it. One thing at a time. One hour at a time if that's what it takes.",
      "Tomorrow is its own thing. It'll bring its own challenges and its own small gifts. But that's tomorrow. Right now you just have <span class='glow-word'>today</span>, and you are completely capable of handling today.",
      "One day at a time. You've gotten through all the ones before this."
    ],
    signature: "Today is enough. You are enough. Just for today.",
    mood: 'comfort', visibility: 'public', author: 'Glow Notes', forWho: ''
  },

  {
    id: 'legacy',
    tag: 'The Long View',
    title: "You're Already Building <span class='glow-word'>Something</span>",
    body: [
      "You probably think about legacy as something that happens later. Something for when you've achieved more, built more, become more. But that's not actually how it works.",
      "You're building it right now. In the way you treat people when nothing is at stake. In the choices you make when nobody's watching. In the version of yourself you bring to the people who need you.",
      "People are different because of you. Not in ways that make the news. In the quieter, realer ways. The conversation that changed how someone thought about something. The moment where you showed up when it counted. The feeling someone carries with them because of how <span class='glow-word'>you made them feel</span>.",
      "That's legacy. And you're already building it every single day."
    ],
    signature: "You're already building something that lasts.",
    mood: 'hopeful', visibility: 'public', author: 'Glow Notes', forWho: ''
  }
];

function getReelById(id) {
  return DEFAULT_REELS.find(r => r.id === id);
}

function getFeaturedReels() {
  return FEATURED_IDS.map(id => getReelById(id)).filter(Boolean);
}
