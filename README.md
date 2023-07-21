# tezdev-2023

How to write a Smart Rollup kernel?

The goal of this repositoy is to show how to implement a small game with kernels.
The game is pretty simple, it's just a player moving arround a map, moving up, down, left or right.

If you want to implement it yourself, here is the step to follow:

## Initialising the state of the rollup.

Let's define a state, and store it under the path `/player`

```rust
struct Player {
    x: i32,
    y: i32
}
```

## Reading messages 

Let's define what can be sent by the user and deserialize it:

```rust
enum Message {
    Upgrade(Certificate)
}
```

## Handling upgrades

Let's use the SDK to verify the certificate and to upgrade the kernel

## Moving the player

Let's enrish the `Message` to add some user actions:

```rust
enum Message {
    Upgrade(Certificate),
    MoveUp,
    MoveDown,
    MoveLeft,
    MoveRight
}
```

# Solution

If you want to know what are the exact code to implement for each steps. You can have a look to the different branches of this repository:

 1. [hello world](https://github.com/Pilou97/tezdev-2023/tree/1-hello-world) 
 2. [initialising the state](https://github.com/Pilou97/tezdev-2023/tree/2-initialising-state)
 3. [reading inputs](https://github.com/Pilou97/tezdev-2023/tree/3-reading-inputs)
 4. [handling upgrades](https://github.com/Pilou97/tezdev-2023/tree/4-how-to-upgrade)
 5. [handling user actions](https://github.com/Pilou97/tezdev-2023/tree/5-processing-inputs)