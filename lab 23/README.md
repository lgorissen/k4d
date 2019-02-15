# 23. Volume secret: passing sensitive information to Pods

Now, having all of this configuration information in a configMap is great ... but there is that typical headache-configuration-use-case: how to handle sensitive information like passwords? You waint to decrease the risk of accidental exposure of this type of information.

The Kubernetes solution is: Secrets!

Kubernetes documentation describes Secrets as *an object that contains a small amount of sensitive data such as a password, a token, or a key*.


![](img/lab23-secret-volume-pod.png)


## Secrets 

**Secrets creation**

Secrets can be created:

- using kubectl command line
- using a manifest file

Depending on your companies requirements around handling sensitive information, either option can be used.

**Secrets use**

Secrets have to be passed on to Pods/Containers, in order for them to use them. That can be done in 2 ways:

1. As Container environment variables
2. As files in a Volume

**System Secrets - default token**

Kubernetes mounts a Secret named *default token* automatically into every Container that is run. This token has the credentials to interface to the Kubernetes API Server from within your Pod. 

**Keeping Secrets safe**

Kubernetes helps in keeping your Secrets safe:

- On the Master node, Secrets are stored in encrypted format
- On the Worker nodes, Secrets are only stored in memory

So, as long as you secure access to kubectl and the Master Node, your Secrets are safe.

## Default token Secret

Let's have a look at this 'default token' Secret that is automatically mounted into every Container.

```bash
developer@developer-VirtualBox:~/projects/k4d$ kubectl get secrets 
NAME                  TYPE                                  DATA      AGE
default-token-7sddz   kubernetes.io/service-account-token   3         21d
developer@developer-VirtualBox:~/projects/k4d$ kubectl describe secrets default-token-7sddz 
Name:         default-token-7sddz
Namespace:    default
Labels:       <none>
Annotations:  kubernetes.io/service-account.name=default
              kubernetes.io/service-account.uid=e668484d-c941-11e8-af5b-0800276251a2

Type:  kubernetes.io/service-account-token

Data
====
ca.crt:     1066 bytes
namespace:  7 bytes
token:      eyJhbGciOiJSUzI1NiIsImtpZCI6IiJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImRlZmF1bHQtdG9rZW4tN3NkZHoiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiZGVmYXVsdCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6ImU2Njg0ODRkLWM5NDEtMTFlOC1hZjViLTA4MDAyNzYyNTFhMiIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDpkZWZhdWx0OmRlZmF1bHQifQ.LZZd7nEKYzAh46yPoj757ILL8k05IXCLZwAYV3mIHdiQLgXgfKPSHM4iosAk11Y_f3MdQeKGBfmoR_Cmpkiimdgtw68dFQd7f_Dc6tyKOcjpbdLrWnHr3zjTweqGAG_hbuDWZNZa6yoSPYe1MWTDRC-21Bx1dsi55mkGfVhIEaOpE73DmdPdd0jOiH18XKRaYN5zqoMICazwFQjKU4hsxAxD_ZavweCpEvGy6cnhATlyjgM_Yt2MKeGKb2oejsm_BNKeZySx4YmyjKUO6aEEksal5mLAeIRSD-FGqntcBLj5Bfv8PmnGlHdWAgSbCJV8ElLhFjheuFcuoKdy4hpUJw
developer@developer-VirtualBox:~/projects/k4d$
```
So, this Secret has the `ca.crt`, `namespace` and `token` that are needed to communicate to the API Server.

Now, let's check if that token is mounted as a Volume into a Pod. We assume that you haven't cleaned up everything on your K8S Cluster, so there is a Pod still active. Ours is Pod 'terra10-rs-2zttd'. Looking at the Pod description, you will find a mounted Volume with the default token:

```bash
developer@developer-VirtualBox:~/projects/k4d$ kubectl describe pod terra10-rs-2zttd
Name:           terra10-rs-2zttd
Namespace:      default
Node:           minikube/10.0.2.15
Start Time:     Sun, 14 Oct 2018 17:04:16 +0200
Labels:         app=terra10
Annotations:    <none>
Status:         Running
IP:             172.17.0.11
Controlled By:  ReplicaSet/terra10-rs

...

Volumes:
  default-token-7sddz:
    Type:        Secret (a volume populated by a Secret)
    SecretName:  default-token-7sddz
    Optional:    false
...

developer@developer-VirtualBox:~/projects/k4d$ 

```
So yes, the Volume is mounted into the Pod. And, looking in the same description, it is also clear that the Volume is mounted into the Container:

```bash
developer@developer-VirtualBox:~/projects/k4d$ kubectl describe pod terra10-rs-2zttd 
Name:           terra10-rs-2zttd
Namespace:      default
Node:           minikube/10.0.2.15
Start Time:     Sun, 14 Oct 2018 17:04:16 +0200
Labels:         app=terra10
Annotations:    <none>
Status:         Running
IP:             172.17.0.11
Controlled By:  ReplicaSet/terra10-rs
Containers:
  terra10:
    Container ID:   docker://932d8f6d2b3e1a3c25abdd8f460a3ce17f237c34bbf54c5d415ba551a4f386a2
    Image:          lgorissen/terra10
    
    ...
    
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from default-token-7sddz (ro)

    ...

developer@developer-VirtualBox:~/projects/k4d$
```

So, the Volume is mounted in the Container 'terra10' in location `/var/run/secrets/kubernetes.io/serviceaccount`. Check that:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 23$ kubectl exec terra10-rs-2zttd -- ls /var/run/secrets/kubernetes.io/serviceaccount
ca.crt
namespace
token
developer@developer-VirtualBox:~/projects/k4d/lab 23$
```

So, should you want to communicate with the Kubernetes API from within your Container, you now know that you have the required credentials available!

## Example

In the remainder, we want to create a Secret that (in the end) is visible in our Container in the two files `/etc/terra10/terra10-user` and `/etc/terra10/terra10-password`. 

We will do this in a couple of steps:

1. Create the Secret
2. Examine the Secret
3. Use the Secret in Pod & Container


### Create your own Secret

There are 3 ways to create the Secret:

1. Using *kubectl* command line - from file
2. Using *kubectl* command line - literal
3. Using a manifest specification

Let's do all 3 options:

**1. Using *kubectl* command line - from file**

Start by making the two files that are needed in your Secret: `terra10-user` and `terra10-password`:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 23$ echo -n 'terra10-admin' > terra10-user
developer@developer-VirtualBox:~/projects/k4d/lab 23$ echo -n 'welcome01' > terra10-password
developer@developer-VirtualBox:~/projects/k4d/lab 23$
```
Now, create the Secret from the 2 input files:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 23$ kubectl create secret generic terra10-from-file --from-file=terra10-user --from-file=terra10-password 
secret/terra10-from-file created
developer@developer-VirtualBox:~/projects/k4d/lab 23$
```

Examine the secret:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 23$ kubectl describe secrets terra10-from-file 
Name:         terra10-from-file
Namespace:    default
Labels:       <none>
Annotations:  <none>

Type:  Opaque

Data
====
terra10-password:  9 bytes
terra10-user:      13 bytes
```

**2. Using *kubectl* command line - literal**

The same Secret could have also been created directly from command-line:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 23$ kubectl create secret generic terra10-literal --from-literal=terra10-user=terra10-admin --from-literal=terra10-password=welcome01 
secret/terra10-literal created
developer@developer-VirtualBox:~/projects/k4d/lab 23$
```

Examine the secret:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 23$ kubectl describe secrets terra10-literal 
Name:         terra10-literal
Namespace:    default
Labels:       <none>
Annotations:  <none>

Type:  Opaque

Data
====
terra10-password:  9 bytes
terra10-user:      13 bytes
developer@developer-VirtualBox:~/projects/k4d/lab 23$ 
```


**3. Using a manifest specification**

The same Secret could have also been created using a manifest file: `terra10-secret.yaml` in the `lab 23`  directory:

```bash
apiVersion: v1
kind: Secret
metadata:
  name: terra10-manifest
type: Opaque
data:
  terra10-username: dGVycmExMC1hZG1pbg==   # the data has to be base64 encoded
  terra10-password: d2VsY29tZTAx           # the data has to be base64 encoded
```

Run it, examine it:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 23$ kubectl create -f terra10-secret.yaml 
secret/terra10-manifest created
developer@developer-VirtualBox:~/projects/k4d/lab 23$ kubectl describe secrets terra10-manifest 
Name:         terra10-manifest
Namespace:    default
Labels:       <none>
Annotations:  <none>

Type:  Opaque

Data
====
terra10-password:  9 bytes
terra10-username:  13 bytes
developer@developer-VirtualBox:~/projects/k4d/lab 23$
```

So, not you've seen 3 ways to create the same Secret.


### Examine your Secrets

Nope, I'm not a shrink.

In your Secrets, the data can be retrieved:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 23$ kubectl get secrets 
NAME                  TYPE                                  DATA      AGE
default-token-7sddz   kubernetes.io/service-account-token   3         21d
terra10-from-file     Opaque                                2         24m
terra10-literal       Opaque                                2         12m
terra10-manifest      Opaque                                2         3m
developer@developer-VirtualBox:~/projects/k4d/lab 23$ kubectl get secrets terra10-literal -o yaml
apiVersion: v1
data:
  terra10-password: d2VsY29tZTAx
  terra10-user: dGVycmExMC1hZG1pbg==
kind: Secret
metadata:
  creationTimestamp: 2018-10-27T11:20:42Z
  name: terra10-literal
  namespace: default
  resourceVersion: "136873"
  selfLink: /api/v1/namespaces/default/secrets/terra10-literal
  uid: 571545db-d9da-11e8-a7cd-0800276251a2
type: Opaque
developer@developer-VirtualBox:~/projects/k4d/lab 23$
```

The data is shown as base64 encoded data:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 23$ echo 'dGVycmExMC1hZG1pbg==' | base64 --decode
terra10-admindeveloper@developer-VirtualBox:~/projects/k4d/lab 23$ echo 'd2VsY29tZTAx' | base64 --decode
welcome01developer@developer-VirtualBox:~/projects/k4d/lab 23$
```

### Mount your Secret as a Volume in the Pod and Container

Now it is time to create a Pod with the previously created Secret visible in our Container in the two files `/etc/terra10/terra10-user` and `/etc/terra10/terra10-password`.

The manifest file `terra10-simple-secret.yaml` is shown below:

```bash
apiVersion: v1
kind: Pod
metadata:
  name: terra10-simple-secret               # Pod name
spec:
  containers:
  - image: lgorissen/terra10                # our basic Container image
    name: terra10
    volumeMounts:
    - name: mysecretvolume                  # mount the Secret Volume into the container
      mountPath: "/etc/terra10"             # path where the Volume is mounted
      readOnly: true                        # yes
    ports:
    - containerPort: 8080
      protocol: TCP
  volumes:
  - name: mysecretvolume                    # define the Volume for the Secret
    secret:
      secretName: terra10-from-file         # name fo the Secret we want to use
```

This defines the following set-up:

![](img/lab23-secret-example.png)

Now, create the Pod and verify that the data is available:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 23$ kubectl create -f terra10-simple-secret.yaml 
pod/terra10-simple-secret created
developer@developer-VirtualBox:~/projects/k4d/lab 23$ kubectl describe pod terra10-simple-secret 
Name:         terra10-simple-secret
Namespace:    default
Node:         minikube/10.0.2.15
Start Time:   Sat, 27 Oct 2018 14:11:25 +0200
Labels:       <none>
Annotations:  <none>
Status:       Running
IP:           172.17.0.13
Containers:
  terra10:
    Container ID:   docker://b973e14c52c8ef3fe94295ed03200954605ce3e52935f7b55a4a26a4812eefe4
    Image:          lgorissen/terra10
    ...
    
    Mounts:
      /etc/terra10 from mysecretvolume (ro)
      /var/run/secrets/kubernetes.io/serviceaccount from default-token-7sddz (ro)
    ...

Volumes:
  mysecretvolume:
    Type:        Secret (a volume populated by a Secret)
    SecretName:  terra10-from-file
    Optional:    false
  default-token-7sddz:
    Type:        Secret (a volume populated by a Secret)
    SecretName:  default-token-7sddz
    Optional:    false
  ...
  
developer@developer-VirtualBox:~/projects/k4d/lab 23$ kubectl exec terra10-simple-secret cat /etc/terra10/terra10-user
terra10-admindeveloper@developer-VirtualBox:~/projects/k4d/lab 23$ 
developer@developer-VirtualBox:~/projects/k4d/lab 23$ kubectl exec terra10-simple-secret cat /etc/terra10/terra10-password
welcome01developer@developer-VirtualBox:~/projects/k4d/lab 23$ 
```

That ends the introduction into Secrets.

**Note the following:** just like with Volumes, check the Kubernetes reference manual to understand how the propagation of changes to Secrets works. It is important to understand if / when changes to Secrets become available in your Container.

Clean up!


