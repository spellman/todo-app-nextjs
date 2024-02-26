# Todo App

https://todo-app-nextjs.now.sh/

This is a todo-list application with basic functionality and sync across devices and browser tabs, built with
* React (https://reactjs.org)
* Redux (https://redux.js.org)
* Next.js (https://nextjs.org)
* Cloud Firestore database (https://firebase.google.com/docs/firestore)
* Material-UI (https://material-ui.com)
* Formik forms library (https://github.com/jaredpalmer/formik)

and deployed on Vercel (https://vercel.com).

The part I like most is the very-fast sync across devices and the handling of external changes to a task that a user is currently editing.

I normally program in Clojure\[Script\] so I used React and Redux, without any functional-programming libraries (like [Ramda](https://ramdajs.com/)), in order to practice mainstream JavaScript with mainstream tools. In keeping with making a static site for Vercel, I used React through Next.js. This is an interesting approach and seems to make a lot of sense &mdash; delivering a skeleton / template or truly static page through a CDN is fast and good for SEO.

I considered Crux (https://opencrux.com) and Fauna (https://fauna.com) for their accrete-only data models but I would have had to have put together my own publish-subscribe. Firebase Cloud Firestore is made for publish-subscribe and so was a pragmatic choice for this exploratory project, even though it updates data in place.

* The app displays instructions when there are no tasks in the list.
* The "ADD TASK" button in the top right corner brings up a form to add a task.
* Task name is required; description, target completion date, and actual completion date are optional.
* Dates can be typed in or selected from a date-picker.
* Click an existing task to edit it.
* Click the checkbox to the left of a task to toggle it complete or incomplete.
    * When a completion date is added to a task, then the task is also toggled complete.
    * When a task is toggled incomplete, then the completion date is cleared if the task had a completion date.
    * I opted not to add a default completion date when toggling a task complete. It's not necessarily the case that it was just completed (the most likely default) so I don't want to add incorrect information. I also may know that a task is complete but not know or care what day it was completed.
        * I suppose I could have added a button to indicate that a task was just completed or I could have temporarily displayed a date-picker when a task is toggled complete.
* Click the trash can icon to the right of a task to delete the task.
* When a user is not editing a task, they can see the results of external updates made to tasks.
* When a user is editing a task, I opted to provide a stable view of the task and not update the edit form to reflect external changes. Rather, I inform the user of the changes with a flash message and let them decide what to do:
    * If the task is toggled complete or incomplete, then the user is informed via a flash message that auto-dismisses after 5 seconds. If the task is again toggled before the existing toggle-notification has dismissed, then the existing notification is immediately replaced with the new notification with the current toggle state.
    * If the name, description, target completion date, or actual completion date of the task is edited, then user is informed via a flash message that does not auto dismiss. The user can choose to either continue editing and to overwite the external changes or to cancel editing and view the changes.
        * On sufficiently large screens, it would be nice to show the changed task or a diff of the changed task against the current form data. I didn't get that far yet.
    * If the task is deleted, then the user is informed via a flash message that does not auto dismiss. The user can choose to either continue editing (and create a new task with the information) or to cancel editing and accept the deletion.
* I opted to make the app as easy to access and use as possible. Although Firebase makes auth and user accounts easy, I chose not to use them. Everyone interacts with the same task list. It's a demo :)

## Notes
I avoided versioning the Firestore documents. They really need to have version numbers that are incremented with each change (or an equivalent scheme) and then there needs to be a Firestore security rule that ensures that a document of lower version doesn't overwrite a document of higher version. (CouchDB does that automatically and would have been a valid choice here. I wanted to explore Firestore, though.) As is, if one user's update is received between when a second user clicks update and when their TaskEditForm view is replaced with a Task view, then the second user will have no idea that they overwrote the first user's change.

I know the standard Redux organizational pattern (which we use in our legacy JavaScript at [Roomkey](https://www.roomkey.com)) is to separate action types, action creators, and reducers into separate files. I like that [Elm](https://elm-lang.org), [Fulcro](https://fulcro.fulcrologic.com), and often [re-frame](http://day8.github.io/re-frame/) co-locate those things / their equivalents, though, so I co-located them in this project.
