---
tags: GitLab Continuous_Integration Continuous_Delivery Gitlab_CI Deployment
description: My Gitlab CI file after 3 years using of gitlab
---

## Problem
When you develop an application or service, you need to test it in a production-like environment, or store versions to revert to previous versions on fails.

These steps are a bit hard and annoying if you do all of them manually. So you need a full-time person to do them even at midnight.

## Solution
[GitLab](https://gitlab.com) (and [GitHub](https://github.com)) has a great tool for automating Deployment named [Gitlab-CI](https://about.gitlab.com/product/continuous-integration/). I don't want to introduce them. You can read their documentation and about sections if you want!

So, let's do these steps to have a complete ci/cd process:

### Step 0

First, you should use [Git](https://git-scm.com) for version control and [Docker](https://www.docker.com/) for containerize your builds, and so forth.
If you haven't used them yet, you're not a developer! Shame on you 😒

I assume I have a simple web server in [Golang](https://golang.org) and want to deploy it on a [Kubernetes](https://kubernetes.io) cluster in both staging and production environment.

### Step 1: Using a Workflow
There are many flows for coding and deployment such as [Git Flow](https://datasift.github.io/gitflow/IntroducingGitFlow.html) or [GitLab FLow](https://docs.gitlab.com/ee/workflow/gitlab_flow.html). You can read about them and use either if you want.

I often use this flow or a simpler one:

1. Develop a feature or fix a bug in a branch (custom name or create a branch from a gitlab issue)
1. Send a merge request to master and merge it if all CI steps passed.
1. Deploy the latest commit of master to the staging environment
1. Tag a commit on master and deploy it to production if I want to release a new version

In this flow, I always test new features on staging before release. If I find a small bug in production, I will fix it and release a new version. Or if I find a big bug, I will deploy an older version, and release a new version when I fix the bug. I really suggest staging to prevent testing in production.

> Remember that staging is an environment to test the current project, not projects that use it. For example, the staging environment of rest is not to test the android application that uses this rest!

### Step 2: Write GitLab CI File

As I said before, you should use Docker to build and containerize your application. I wrote a [Blog Post](https://nasermirzaei89.net/2018/12/25/dockerize-go-application/) before for dockerizing a go application.

Add a `.gitlab-ci.yml` file to your project:
```sh
touch .gitlab-ci.yml
```

You should have 3 stages in your CI:

* Build
* Test
* Deploy

Add them to your CI file:

```yml
stages:
  - Build
  - Test
  - Deploy
```

You can split your steps into 3 sections:

* Development
* Staging
* Production

#### Lint

I always check my code is pretty linted only in development:

```yml
# Development

Lint:
  stage: Test
  image: golangci/golangci-lint:v1.21.0
  script:
    - make lint
  except:
    - master
    - tags
```

As you see, this step will run on every branch except master.
I know that alpine images are smaller than default, but I didn't use alpine because I need `Makefile` support.

> You can add a pre-commit hook to check lint step on your local repo before gitlab!

#### Build

After checking lint you should check that your code will build or not:

```yml
Build:
  stage: Build
  image: golang:1.13
  script:
    - make build
  except:
    - master
    - tags
```

I always use a version of Golang that is installed on my development pc.

As you see, this step is also excluded from the master branch. because I only check whether my code builds or not, and leave the binary alone after every build.

#### Test

Like lint step, we also should check our new code will pass all tests or not:

```yml
Test:
  stage: Test
  image: golang:1.13
  script:
    - make test
  except:
    - master
    - tags
```

You can split this step to multiple steps if you have separate tests:

```yml
Unit Test:
  stage: Test
  image: _MyUnitTesterImage_
  script:
    - make unit-test
  except:
    - master

Acceptance Test:
  stage: Test
  image: _MyAcceptanceTesterImage_
  script:
    - make acceptance-test
  except:
    - master
    - tags

# Other tests...
```

After these steps, your code may merge to master. You can prevent code to merge before passing ci in your project settings page.

Now your code merged to master it's time to run CI jobs on this branch.

#### Build Image Latest

in this step you should build an image for the staging environment:

```yml
# Staging

Build Image Latest:
  stage: Build
  image: docker
  services:
    - docker:dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build --tag $CI_REGISTRY_IMAGE:latest .
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - master
  except:
    - tags
```

In this step we use Docker for building an image, so we must use a docker image.

At the first script, we assume to use our gitlab registry to push our image to it. So, we must log in to this registry before build and push. `$CI_JOB_TOKEN` is a token to login in your gitlab registry and `$CI_REGISTRY` is the address of the registry.

After the login, we build our image with a tag name that contains `$CI_REGISTRY_IMAGE` and docker tag `latest`. for example, this will be: `registry.nasermirzaei89.net/myproject/api:latest`

At the end, we push the image to the registry. Now you can check your registry to see your new image created with `latest` tag.

#### Deploy Staging

I always deploy my code automatically to staging:

```yml
Deploy Staging:
  stage: Deploy
  image: registry.nasermirzaei89.net/gitlab-ci/kubectl:latest
  script:
    - cat kubernetes.tpl.yml | sed "s/{{NAMESPACE}}/myproject-staging/g; s/{{TAG}}/latest/g; s/{{HOST}}/api.staging.myproject.nasermirzaei89.net/g" | kubectl apply -f -
  only:
    - master
  except:
    - tags
```

Again, I used a pre-made image for a step. As you see, I deploy my code to a kubernetes cluster by kubectl.
I built this image with the config of my cluster.
So, it connects to my cluster without requesting authorization info.
Also, I used a template file for deploying on kubernetes and replaced variables with `sed` command.

Now it's time to release!

#### Release a Tag

When you want to add a tag to a commit for a version, you should create an image from this tag automatically:

```yml
Build Image Tag:
  stage: build
  image: docker
  services:
    - docker:dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build --tag $CI_REGISTRY_IMAGE:$CI_COMMIT_TAG .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_TAG
  only:
    - tags
```

`$CI_COMMIT_TAG` is the name of the tag, eg: `v1.2.0`.
So, it doesn't mean that this step only runs on `tags`

after passing this build stage on a tag, see the registry section on your gitlab to make sure the image has been built with the expected tag.

Be careful you said to run on master or except master in last steps so many of them will run on `tags`. You need to exclude them from tags to prevent running them on tagging a version.
Add this to all last steps.
```yml
  except:
    - tags
```

#### Deploy Production

After building an image with a specific tag, we want to deploy it on production:

```yml
Deploy Production:
  stage: Deploy
  image: registry.nasermirzaei89.net/gitlab-ci/kubectl:latest
  script:
    - cat kubernetes.tpl.yml | sed "s/{{NAMESPACE}}/myproject/g; s/{{TAG}}/$CI_COMMIT_TAG/g; s/{{HOST}}/api.myproject.nasermirzaei89.net/g" | kubectl apply -f -
  when: manual
  only:
    - tags
```

You can see I used `$CI_COMMIT_TAG` instead of `latest` in my variable replacement.

Also, this step is `manual` and you must play it manually. So, when you want to revert to an earlier version, you can play `Deploy Production` job on that version in pipelines, and that version will deploy to production.

Your `.gitlab-ci.yml` file at a glance:

```yml
stages:
  - Build
  - Test
  - Deploy

# Development

Lint:
  stage: Test
  image: golangci/golangci-lint:v1.21.0
  script:
    - make lint
  except:
    - master
    - tags

Build:
  stage: Build
  image: golang:1.13
  script:
    - make build
  except:
    - master
    - tags

Test:
  stage: Test
  image: golang:1.13
  script:
    - make test
  except:
    - master
    - tags

# Staging

Build Image Latest:
  stage: Build
  image: docker
  services:
    - docker:dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build --tag $CI_REGISTRY_IMAGE:latest .
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - master
  except:
    - tags

Deploy Staging:
  stage: Deploy
  image: registry.nasermirzaei89.net/gitlab-ci/kubectl:latest
  script:
    - cat kubernetes.tpl.yml | sed "s/{{NAMESPACE}}/myproject-staging/g; s/{{TAG}}/latest/g; s/{{HOST}}/api.staging.myproject.nasermirzaei89.net/g" | kubectl apply -f -
  only:
    - master
  except:
    - tags

Build Image Tag:
  stage: build
  image: docker
  services:
    - docker:dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build --tag $CI_REGISTRY_IMAGE:$CI_COMMIT_TAG .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_TAG
  only:
    - tags

Deploy Production:
  stage: Deploy
  image: registry.nasermirzaei89.net/gitlab-ci/kubectl:latest
  script:
    - cat kubernetes.tpl.yml | sed "s/{{NAMESPACE}}/myproject/g; s/{{TAG}}/$CI_COMMIT_TAG/g; s/{{HOST}}/api.myproject.nasermirzaei89.net/g" | kubectl apply -f -
  when: manual
  only:
    - tags
```

It's my GitLab CI file in most projects, but it may be simpler or more complex in some projects.
Also, you might have tags for your runners. So, you must add tags to select a runner in your steps.

Love automation and make development enjoyable!
