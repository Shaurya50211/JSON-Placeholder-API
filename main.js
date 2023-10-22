const BASE_URL = "https://jsonplaceholder.typicode.com"
let form = document.querySelector("form")
let greetingDiv = document.getElementById('greetingDiv')
let userData;
let postsDiv = document.getElementById('postsDiv')



form.addEventListener('submit', showUser)

async function showUser(e) {
    e.preventDefault()

    // get user id from text input
    let userID = e.target["userID"].value

    greetingDiv.innerHTML = `
    <h1>
        Loading...
    </h1>
`
    // see if fetch request was success if so return out to of the function
    const userData = await getUser(userID)
    if (!userData.isSuccess) {
        greetingDiv.innerHTML = `
      <h1 id="errorContent">${userData.error}</h1>
    `
        return;
    }

    // Show the users
    greetingDiv.innerHTML = `
    <h1>Welcome <a target='_blank' href="https://${userData.website}">${userData.name}</a></h1>

    <button id="showPostsButton">Get Posts</button>
  `

    // add event listner to getPostButton and call getPosts
    let getPostButton = document.getElementById('showPostsButton')
    getPostButton.addEventListener('click', () => {
        showPosts(userData.id)
    })
}

async function getUser(userID) {

    try {
        let response = await fetch(BASE_URL + `/users/${userID}`)
        if (response.ok) {
            userData = await response.json()
            return {
                ...userData,
                isSuccess: true
            }
        } else {
            throw new Error("User ID not found")
        }

    } catch (error) {
        return {
            isSuccess: false,
            error
        }
    }
}

async function getPosts(userID) {
    try {
        let response = await fetch(BASE_URL + `/users/${userID}/posts`)
        if (response.ok) {
            let posts = await response.json()

            return posts


        } else {
            throw new Error("There was an issue fetching user data please try again later")
        }
    } catch (error) {
        return error
    }
}

async function showPosts(userID) {
    let posts = await getPosts(userID)
    if (typeof posts !== 'object') {
        greetingDiv.innerHTML = `<h1 id="errorContent">${posts}</h1>`
        return;
    } else {
        postsDiv.innerHTML = `
    <h1>Your Posts</h1>

    <div>
    <div class="postBox" id="createPostBox">
      <form class="createPostBox">
        <input type="text" name="title" required placeholder="Post Title">
        <textarea rows='10' name="body" required placeholder="Post Content"></textarea>
        <button type='submit'>Create</button>
      </form>
      <span id="postStatus"></span>
    </div>

    ${posts.map(post => {
            return `
              <div class="postBox">
                <span>${post.title}</span>
                <p>${post.body}</p>
                <button class='editPostButton' data-postid="${post.id}">Edit</button>
                <button class="commentButton" data-postid="${post.id}">Comments</button>
                <div class="commentsDiv"></div>
              </div>
            `
        }).join("")}
      </div>
`


        let postStatusSpan = postsDiv.querySelector('#postStatus')
        let createPostsForm = postsDiv.querySelector('form')
        createPostsForm.addEventListener('submit', async (e) => {
            e.preventDefault()
            let title = e.target['title'].value;
            let body = e.target['body'].value;
            let postStatus = await createPost(userID, title, body)

            if (postStatus) {
                postStatusSpan.innerText = "Post Created!"
            } else {
                postStatusSpan.innerText = "Failed to create post."
            }

        })

        let editPostButtons = postsDiv.querySelectorAll('.editPostButton')
        let getCommentButtons = postsDiv.querySelectorAll('.commentButton')


        editPostButtons.forEach(editButton => {
            const postId = editButton.dataset.postid

            editButton.addEventListener('click', () => {
                let post = posts.find(post => post.id === Number(postId))
                let formContent = `
            <form class="createPostBox">
                <input type="text" name="title" required value="${post.title}">
                <textarea rows='10' name="body" required>${post.body}</textarea>
                <button type='submit'\>Confirm</button>
            </form>
        `

                let postDiv = editButton.parentElement
                postDiv.innerHTML = `
            ${postDiv.innerHTML}
            ${formContent}
        `
            })
        })
        getCommentButtons.forEach(commentButton => {
            const postId = commentButton.dataset.postid

            commentButton.addEventListener("click", (e) => {
                getComments(postId, e.target)
            })
        })
    }
}




async function createPost(userId, title, body) {
    const config = {
        method: 'POST',
        body: JSON.stringify({
            title,
            body,
            userId
        })
    }

    try {
        const response = await fetch(`${BASE_URL}/posts`, config)
        if (response.ok) {
            return true;
        } else {
            throw new Error("Error creating post, try again later")
        }
    } catch (error) {
        alert(error)
        return false;
    }
}

async function getComments(postID, button) {
    try {
        const response = await fetch(`${BASE_URL}/posts/${postID}/comments`)
        if (response.ok) {
            let data = await response.json()
            let commentsDisplay = button.nextElementSibling

            commentsDisplay.innerHTML = `
                <h2>${data.length} Comments<h2>

                ${data.map(comment => {
                return `<p>${comment.body}</p>`
            }).join("")}

            `
        } else {
            throw new Error("There was an issue fetching comments.")
        }
    } catch (error) {
        alert(error)
    }
}