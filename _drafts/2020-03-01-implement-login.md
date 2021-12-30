---
tags: Login Development Rest_API
description: In this article I want to talk about how to implement user login
---

In this article I want to discuss how to implement user login.
Login is the way to authenticate user in the application or service.

There are many ways to authenticate a user.
I'll talk about each type and how to implement it.

## Login with Password

This login type was the only way to authenticate users in the past.
But, these days there are better and more secure ways to do this process.

In this method, you must register before login.
Keep in mind that registration is not a part of login process, but you can log user in after registration without separate request for login.

For login with password user need to provide `username` and `password`.
They submitted these parameters on registration stage.

They should use a password that is hard to guess and is long enough.
Most people use the **worst passwords** in registration.
You can find them by searching it in Google.
So, you can check passwords to be enough complex and hard to guess before accepting it in registration process.

Next tip is what user should do if forgot their password? How should they recover or reset it?

You need to send the instruction to a place that only the user have access to it. For example their email address, or phone number.
So, you should get their email address or phone number in registration process, or even verify it.
Then you can send reset instruction or link to the user email address.
Be aware that you should not store user passwords without hashing it. So, you can't send user password to their email address, because you don't have it.
There are many cases of databases that are hacked and user passwords has been stolen from them, because they stored passwords simply without hashing.

There is a password hashing function that is designed by "Niels Provos" and "David Mazières", based on the Blowfish cipher, and presented at USENIX in 1999.
with `bcrypt` you can hash user passwords and when user tries to login, you compare their password with this hash instead of simple comparison.

Hey, hackers can try to login with random generated passwords to find the correct one for critical users. Of course yes!
But bcrypt has a cost for compare password with the hash. So, it's not fast as we think to do this comparison.
And it takes a long time to find the correct password.

Also it's good to limit login tries for a username or an IP.
For example user must wait for 5 minutes after 5 failed attempts.

By the way, this method is not the best way to login, because it's hard for most users to remember their password and boring to type complex passwords.
And they want to use simple passwords like `123456` that is so easy to guess.

And it's start of rising new methods for login.

## Login by OTP

These days it's the most popular way to log the user in. OTP or One Time Password

It is simple:

1. User enter their phone number.
1. You send a onetime code to the phone number.
1. User submits the code.

In this method:
1. user doesn't need to remember any password or even username.
1. No one can hack or guess their passwords. Phone number and cell phone are personal things.
1. They have not to type a long secure complex password for login.

You should consider some tips in implementing this method.

You should send a simple code to user phone number, because we don't want to use another long complex password.
It can be simple as `1234`.
It can be so guessable. So this code should have short lifetime (for example 5 minutes). After this time user must request new code to enter.

It doesn't matter to send different codes to different users at the same time. Because this code is only generated for this phone number and will expire after its life.

What about hackers?
They can request an OTP for my phone number and try to guest it.
Because it's a number in range 1000 to 9999.

Don't worry.
Only limit user requests count to decrease hacker's attempts.
And after 5 minutes, hacker have to restart.
