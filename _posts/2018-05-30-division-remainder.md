---
tags: Programming Math
description: What's wrong with division remainder???
---

I had decided to make an online Rock Paper Scissors game, to make myself ready for greater games.
I'm a backend developer, and I haven't enough abilities and experience for creating games. So, I started to learn Unity3D, and I searched YouTube for creating Rock Paper Scissors. I watched about 2 videos, and I saw they write long if statements for checking who wins.

```csharp
if (p1Choice == p2Choice)
{
    // Draw
}

if (p1Choice == Rock && p2Choice == Paper)
{
    // Player 2 Wins
}
// and 6 more if to check all states
```

Therefore, I tried to think and find an algorithm to write a shorter way to check who wins, and I found a solution:

First, give a number to each element.

```csharp
Rock = 1
Paper = 2
Scissors = 3
```

Then, check result of this expression:

```csharp
int Result = (Player1Choice - Player2Choice) % 3;
switch (Result)
{
    case 0:
        // Draw
        break;
    case 1:
        // Player 1 Wins
        break;
    case 2:
        // Player 2 Wins
        break;
}
```

In some cases, the result of subtraction in that expression will be negative. So, I checked the value of division with a negative dividend in C#, and I wondered the remainder was negative. I checked formula for [integer division](https://en.wikipedia.org/wiki/Remainder), and I made sure the remainder valid range is between zero and absolute of divisor: `0 ≤ r < |d|`.
I checked my favorite Golang, to see the result:

[https://play.golang.org/p/9yuhk1IKSgE](https://play.golang.org/p/9yuhk1IKSgE)

but the remainder was negative.

I checked PHP, but the remainder was negative.

I checked JavaScript, but the remainder was negative.

I didn't check other languages.

I checked the source of mod function in golang and found it should not be remaindering of the division:
[https://github.com/golang/go/blob/release-branch.go1.10/src/math/mod.go#L23](https://github.com/golang/go/blob/release-branch.go1.10/src/math/mod.go#L23)

To be continued...
