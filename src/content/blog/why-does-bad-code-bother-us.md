---
title: "why does bad code bother us — when it works?"
description: "A question arrived while I was staring at a perfectly working Rails controller. It has been following me ever since."
date: 2026-10-10
tags: ["philosophy"]
notes:
  - "margin note: this is Act I of my talk From Plato to Production."
  - "currently reading Sophie's World — every chapter gives me a new talk idea. dangerous book."
  - "note to self: the Ruby community's obsession with beauty = Platonism. write about Matz someday."
---

A fourteen-year-old girl finds a note in her mailbox. No sender. Just two questions: *"Who are you?"* and *"Where does the world come from?"* She can't answer them. She can't stop thinking about them either.

That's the opening of *Sophie's World*. What struck me wasn't the questions — it was <span class="hl hl-yellow">that feeling of a question that arrives uninvited and won't leave you alone</span>.

I have a question like that. Why does bad code bother us — when it works?

## there's a perfect version of your code, and you'll never ship it

Every developer carries a version of their system in their head that the real codebase keeps failing to live up to. Where does that image come from? Why does it feel so *real* when it doesn't exist?

Plato said the things we see and touch are shadows of perfect forms. The chair you sit on is an imperfect copy of the ideal Chair. <span class="hl hl-purple">Your code is an imperfect copy of the ideal system.</span>

```ruby
# before
def process(account)
  account.loans.each do |loan|
    if loan.due_date < Date.today && !loan.returned?
      loan.update(overdue: true)
      AccountMailer.overdue_notice(account, loan).deliver_later
      account.increment!(:penalty_points)
    end
  end
end

# after
def handle_overdue_books(account)
  account.loans.overdue.each do |loan|
    loan.mark_overdue!
    notify_member(account, loan)
    penalize(account)
  end
end
```

The after reads like policy: for each overdue book, mark it, notify the member, penalize the account. A librarian would recognise it immediately. The before has the same policy buried inside it — the concept of *overdue* trapped in a conditional, with no name, no shape, no form.

> why does refactoring feel like uncovering something, rather than building something?
>
> Plato already answered that.

This is why bad code feels wrong even when it works: it is failing to approximate the form you can see clearly in your mind. The Ruby community's love of beautiful, expressive code? That's Platonism. Matz didn't just want a language that worked — he wanted one that felt *true*.

But then Monday happens. And Aristotle has something to say about that — in the next entry.
