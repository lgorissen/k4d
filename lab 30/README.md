# 30. Kubernetes API Server: client libraries

The DownwardAPI volume provides access to some metadata of a Pod and its Containers. But sometimes you'll want more. Then, you have to talk directly to the Kubernetes API Server!

In this one and the next couple of labs, we will show several ways to access the Kubernetes API Server:

- **lab 27:** Use *curl and the kubectl proxy*
- **lab 28:** Use *curl - from within a Pod*
- **lab 29:** Use *curl - and a sidecar Container*
- **lab 30:** Use *client libraries*

All-in-all, that should give you enough tools to handle your requirements.

This lab will cover an example for the *client libraries*.

## 30.1 Client libraries - what and when?

For programmatic access to the Kubernetes API Server, there are quite some libraries available, for lots of languages. The offically Kubernetes supported languages are *Go* and *Python*. However, many more libraries can be found here: https://kubernetes.io/docs/reference/using-api/client-libraries/

The previous labs centered around using *curl* to access the Kubernetes API Server. That will cover a lot of simple use cases. However, when things get more complicated, you will want/need to switch to a client libary!

## 30.2 Client libraries - a Python example

The example in this lab wil run a Python script in a Pod/Container. So, we need:

1. Python script
2. Container definition that includes the Python script
3. Pod definition

Let's get to it.

**Python script**

The Python example is using a slightly modified Python script from the Kubernetes reference:

```python
from kubernetes import client, config

config.load_incluster_config()   # this ensures that the script can run in a Pod

v1=client.CoreV1Api()
print("Listing pods with their IPs:")
ret = v1.list_pod_for_all_namespaces(watch=False)
for i in ret.items:
    print("%s\t%s\t%s" % (i.status.pod_ip, i.metadata.namespace, i.metadata.name))
```    
Note the change that ensures that the script can also run in a Pod.

This script - when run in a Pod/Container - will print the IP addresses for all Pods.

**Container definition that includes the Python script**

The Container is defined in a Dockerfile in the `lab 30/terra10-python-client` directory:

```bash
FROM python:3                          # image with python
RUN pip install kubernetes             # add the Kubernetes module
ADD python-client.py python-client.py  # add out Python script
```
You don't have to build the Container image yourself, it is available as `lgorissen/terra10-python-client`.

**Pod definition**

The Container must be put in a Pod. The Pod's manifest file is named `terra10-python-client.yaml` and can be found in the `lab 30` directory:

```bash
apiVersion: v1
kind: Pod
metadata:
  name: terra10-python-client
spec:
  containers:
  - name: terra10-python-client            # container terra10-python-client
    image: lgorissen/terra10-python-client
    command: ["sleep", "9999999"]          # keep container running
```


## 30.3 Client libraries example - run it!

Finally, the big moment is there. 

Create the Pod:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 30$ kubectl create -f terra10-python-client.yaml 
pod/terra10-python-client created
developer@developer-VirtualBox:~/projects/k4d/lab 30$ kubectl get pod
NAME                    READY     STATUS    RESTARTS   AGE
terra10-python-client   1/1       Running   0          4s
developer@developer-VirtualBox:~/projects/k4d/lab 30$
```

Exec into the Pod and run the Python scipt:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 30$ kubectl exec -it terra10-python-client -- /bin/bash
root@terra10-python-client:/# ls
bin   dev  home  lib64	mnt  proc	       root  sbin  sys	usr
boot  etc  lib	 media	opt  python-client.py  run   srv   tmp	var
root@terra10-python-client:/# python python-client.py 
Listing pods with their IPs:
172.17.0.4	default	terra10-python-client
172.17.0.5	kube-system	coredns-c4cffd6dc-9wm6f
10.0.2.15	kube-system	etcd-minikube
10.0.2.15	kube-system	kube-addon-manager-minikube
10.0.2.15	kube-system	kube-apiserver-minikube
10.0.2.15	kube-system	kube-controller-manager-minikube
172.17.0.2	kube-system	kube-dns-86f4d74b45-2sk7r
10.0.2.15	kube-system	kube-proxy-8dmdc
10.0.2.15	kube-system	kube-scheduler-minikube
172.17.0.3	kube-system	kubernetes-dashboard-6f4cfc5d87-j4jqq
10.0.2.15	kube-system	storage-provisioner
root@terra10-python-client:/# 
```

That's all folks. Clean up!


