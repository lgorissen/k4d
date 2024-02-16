# 20. Volume gitRepo

The *gitRepo* Volume clones a Git repository into your Pod. Next, that Volume can be mounted into your Docker Container. Just like with the emptyDir Volume, its contents are deleted when the Pod is deleted. Note that the gitRepo Volume does not support private or authenticated Git repos.

The *gitRepo* Volume is ***deprecated***: the recommended alternative is to 'mount an EmptyDir into an InitContainer that clones the repo using git, then mount the EmptyDir into the Pod’s container' (from the Kubernetes documentation).

Nevertheless, we will cover it here briefly as you may run into it in older installations.

## 20.1 gitRepo example

 
The target situation is that of a Pod that can be queried and then returns the directory listing of the attached gitRepo volume.

The manifest file `terra10-gitrepo.yaml` looks like:

```bash
apiVersion: v1
kind: Pod
metadata:
  name: terra10-gitrepo                # Pod name
spec:
  containers:
  - image: lgorissen/terra10-gitrepo   # container that recursively lists its dir /tmp/gitRepo
    name: terra10-gitrepo
    volumeMounts:
    - name: terra10-git-volume         # name of Volume that is mounted in Container
      mountPath: /tmp/gitRepo          # mount path for the Volume
    ports:
    - containerPort: 8094
      protocol: TCP
  volumes:                             # Pod Volume specification starts here
  - name: terra10-git-volume           # name of the Volume
    gitRepo:                           # type of Volume: gitRepo
      repository: "https://github.com/lgorissen/k4d.git"   # location of Git repo
      revision: "42ee9a72a82e35aa017a132c9b553ad79c05421e" # commit number for Git repo
```

## 20.2 Run and Test

Not much to say here:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 20$ kubectl create -f terra10-gitrepo.yaml 
pod/terra10-gitrepo created
developer@developer-VirtualBox:~/projects/k4d/lab 20$
```

and 

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 20/terra10-gitrepo$ kubectl describe pod terra10-gitrepo | grep "^IP:" 
IP:                 172.17.0.10
developer@developer-VirtualBox:~/projects/k4d/lab 20$ curl  172.17.0.10:8094 
Directory listing of gitRepo :
/tmp/gitRepo/k4d/.git/HEAD
/tmp/gitRepo/k4d/.git/ORIG_HEAD
/tmp/gitRepo/k4d/.git/config
/tmp/gitRepo/k4d/.git/description
/tmp/gitRepo/k4d/.git/hooks/applypatch-msg.sample
/tmp/gitRepo/k4d/.git/hooks/commit-msg.sample
/tmp/gitRepo/k4d/.git/hooks/fsmonitor-watchman.sample
/tmp/gitRepo/k4d/.git/hooks/post-update.sample
/tmp/gitRepo/k4d/.git/hooks/pre-applypatch.sample
/tmp/gitRepo/k4d/.git/hooks/pre-commit.sample
/tmp/gitRepo/k4d/.git/hooks/pre-push.sample
/tmp/gitRepo/k4d/.git/hooks/pre-rebase.sample
/tmp/gitRepo/k4d/.git/hooks/pre-receive...
```
Clean up!
