# 8. Docter, docter! My Pod is ill... (Probes)

Most of the labs so far are using only very basic functionality of Kubernetes. A bit of manual starting and stopping and labelling containers is not very advanced container management. That may make you wonder what the big Kubernetes-container-management fuzz is about... Don't worry, the next labs will reveal more management functionality.

This lab and the next ones will focus on functionality to deal with Pod failures. We will link the Kubernetes functionality to the type of failures that it will be handle.

## Container crash

Let's look at what happens with a manually started Pod...when the container crashes...
We will start the Pod terra10-simple (file in the `lab 8` directory) and then stop the Docker container manually - to simulate a container crash. The Kubelet should detect that the container is no longer present and will start a new container. So, after a short while, the Pod should be functioning again. Let's go:

** start the Pod and check that it works **

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 8$ k create -f terra10-simple.yaml 
pod/terra10-simple created
developer@developer-VirtualBox:~/projects/k4d/lab 8$ k describe pod | grep '^IP*' 
IP:           172.17.0.4
developer@developer-VirtualBox:~/projects/k4d/lab 8$ curl 172.17.0.4:8080
Hello, you landed on Terra10 and host terra10-simple welcomes you!
developer@developer-VirtualBox:~/projects/k4d/lab 8$ k get pod
NAME             READY     STATUS    RESTARTS   AGE
terra10-simple   1/1       Running   0          40s
developer@developer-VirtualBox:~/projects/k4d/lab 8$
```
** stop the Docker container manually: **

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 8$ docker ps | grep "lgorissen/terra10" 
9476fc115575        lgorissen/terra10            "node terra10.js"        About a minute ago   Up About a minute                       k8s_terra10_terra10-simple_default_da2eddd1-bd7a-11e8-92aa-0800276251a2_0
developer@developer-VirtualBox:~/projects/k4d/lab 8$ docker stop 9476f
9476f
developer@developer-VirtualBox:~/projects/k4d/lab 8$
```

** observe **

Now, the kubelet should have started a new container (check for the new number) and the Pod should still be accessible:
```bash
developer@developer-VirtualBox:~/projects/k4d/lab 8$ docker ps | grep "lgorissen/terra10" 
b9930f825b93        lgorissen/terra10            "node terra10.js"        About a minute ago   Up About a minute                       k8s_terra10_terra10-simple_default_da2eddd1-bd7a-11e8-92aa-0800276251a2_1
developer@developer-VirtualBox:~/projects/k4d/lab 8$ curl 172.17.0.4:8080
Hello, you landed on Terra10 and host terra10-simple welcomes you!
developer@developer-VirtualBox:~/projects/k4d/lab 8$ 
```
Looking at the Pod shows that a restart has been done:
```bash
developer@developer-VirtualBox:~/projects/k4d/lab 8$ k get pod
NAME             READY     STATUS    RESTARTS   AGE
terra10-simple   1/1       Running   1          5m
developer@developer-VirtualBox:~/projects/k4d/lab 8$ 

```

So, what happened in the above scenario is that the crashed container is automatically re-started by the Kubelet. This is default Pod behaviour that you'll get for free...

## Container not running - Liveness Probe

A container can experience failures that do not result in a crash. For example, if the application is in a deadlock. In such cases, a re-start of the container may help to recover the application.
In Kubernetes a Pod can define a Liveness Probe. The kubelet will then execute the defined Liveness Probe and based on the outcome, it may decide to restart the container:

![probe OK](img/lab8-probe-success.png)

As long as the probe returns the result ***sucess**, nothing will happen.

However, the probe can also return ***failure**:

![probe OK](img/lab8-probe-failure.png)

In this case, the kubelet will restart the container:

![probe OK](img/lab8-probe-restart.png)

The proof of the pudding is in the eating, so we'll try the following recipe:
- Create an app/container that has a liveness problem
- Start a Pod with this container AND a Liveness Probe
- Observe!

** Create an app/container that has a liveness problem **

The container image `lgorissen/terra10:liveness-problem` is already present in Docker Hub. For those of your who want to have a look at it, the code is in the `lab 8/terra10-liveness-problem'` directory.
This image will return upon the first 5 requests a response with HTTP 200 code. After the fifth request, it will return an HTTP 500 code:
```bash
developer@developer-VirtualBox:~/projects/k4d/lab 8$ docker run -d -p 8080:8080 lgorissen/terra10:liveness-problem 
511feac933d5cc9d18720901a6a0866946b08503b1688919a5ebff4364a3d75f
developer@developer-VirtualBox:~/projects/k4d/lab 8$ curl localhost:8080
Hello, you landed on Terra10 and host 511feac933d5 welcomes you!
developer@developer-VirtualBox:~/projects/k4d/lab 8$ curl localhost:8080
Hello, you landed on Terra10 and host 511feac933d5 welcomes you!
developer@developer-VirtualBox:~/projects/k4d/lab 8$ curl localhost:8080
Hello, you landed on Terra10 and host 511feac933d5 welcomes you!
developer@developer-VirtualBox:~/projects/k4d/lab 8$ curl localhost:8080
Hello, you landed on Terra10 and host 511feac933d5 welcomes you!
developer@developer-VirtualBox:~/projects/k4d/lab 8$ curl localhost:8080
Hello, you landed on Terra10 and host 511feac933d5 welcomes you!
developer@developer-VirtualBox:~/projects/k4d/lab 8$ curl localhost:8080
Something went wrong in your landing - this landing platform is malfunctioning: 511feac933d5
developer@developer-VirtualBox:~/projects/k4d/lab 8$ curl localhost:8080
Something went wrong in your landing - this landing platform is malfunctioning: 511feac933d5
developer@developer-VirtualBox:~/projects/k4d/lab 8$ curl localhost:8080
Something went wrong in your landing - this landing platform is malfunctioning: 511feac933d5
developer@developer-VirtualBox:~/projects/k4d/lab 8$ docker stop 511f
511f
developer@developer-VirtualBox:~/projects/k4d/lab 8$
```

** Start a Pod with this container AND a Liveness Probe **

Now, we will define a Pod that (1) uses this malfunctioning container and (2) has a Liveness Probe configured. The manifest file looks like:
```bash
apiVersion: v1
kind: Pod
metadata:
  name: terra10-liveness                        # Pod name
spec:
  containers:
  - image: lgorissen/terra10:liveness-problem   # use the faulty image
    name: terra10
    livenessProbe:                              # Liveness Probe specification starts here
      httpGet:                                  # Probe of type httpGet
        path: /									# Probe calls http://<Pod IP addres:8080/
        port: 8080
      initialDelaySeconds: 15                   # wait 15 seconds after the container is started
                                                # before invoking the probe
```
The comments in the above file are pretty self explanatory. Nevertheless:
- next to probe type `httpGet`, a probe can also be of type `exec` and `tcpSocket` : look them up in the reference documentation
- by default, the probe is executed every 10 seconds

Run the Pod:
```bash
developer@developer-VirtualBox:~/projects/k4d/lab 8$ k create -f terra10-liveness-problem.yaml 
pod/terra10-liveness created
developer@developer-VirtualBox:~/projects/k4d/lab 8$ k describe pod terra10-liveness | grep "IP:"
IP:           172.17.0.5
developer@developer-VirtualBox:~/projects/k4d/lab 8$ curl 172.17.0.5:8080
Hello, you landed on Terra10 and host terra10-liveness welcomes you!
developer@developer-VirtualBox:~/projects/k4d/lab 8$ k get pod
NAME               READY     STATUS    RESTARTS   AGE
terra10-liveness   1/1       Running   0          1m
developer@developer-VirtualBox:~/projects/k4d/lab 8$ 
```
The Pod is running ...

** Observe! **

If you wait a couple of minutes, and look at the Pods, you will see something like:
```bash
developer@developer-VirtualBox:~/projects/k4d/lab 8$ k get pod
NAME               READY     STATUS    RESTARTS   AGE
terra10-liveness   1/1       Running   3          6m
developer@developer-VirtualBox:~/projects/k4d/lab 8$
```
Ah, our Pod has been re-started 3 times. In short: the liveness probe has already re-started the faulted container 3 times. 

For a better understanding of how the Liveness Probe works and what can be configured, use the command `k describe pod terra10-liveness`  and have a close look at the output. Below, a description of the relevant parts of the Liveness Probe:
```bash
    Liveness:       http-get http://:8080/ delay=15s timeout=1s period=10s #success=1 #failure=3
```
This line means:

|  item         | description                        |
|---------------|------------------------------------|
| http-get      | Probe type                         |
| http://:8080/ | Action that the Probe will perform |
| delay=15s     | Number of seconds after the container has started before liveness probes are initiated. |
| timeout=1s    | Number of seconds after which the probe times out. |
| period=10s    | How often (in seconds) to perform the probe.|
| #success=1    |Minimum consecutive successes for the probe to be considered successful after having failed.|
| #failure=3    | Minimum consecutive failures for the probe to be considered failed after having succeeded.| 

Clean up!


## Container not ready to service requests - Readiness Probe

Another typical situation for failures. Upon start-up, the Pod/container may have a substantial  initialization period. For example for establishing connections with other systems, building up caches in memory, etc. Readiness Probes to the rescue. A Readyness Probe determines if the Pod can handle requests. If not, not more new requests are routed to that Pod until the Readyness Probe determines that the Pod is ready to handle requests again.

When 'the Pod's Ready contidition' is true, Kubernetes will route requests to that Pod. If not, Kubernetes will route the requests to another Pod copy that is able to receive requests.

Again, the proof of the pudding is in the eating, so we'll:
- Create an app/container that has a readiness problem
- Start a Pod with this container AND a Readyness Probe
- Observe!

** Create an app/container that has a readiness problem **

The container image `lgorissen/terra10:readiness-problem` is already present in Docker Hub. For those of your who want to have a look at it, the code is in the `lab 8/terra10-readiness-problem'` directory.
This image will return a response with HTTP 200 code for the first 10 requests. Then, it will return an HTTP 500 code for the next 10 requests. And then HTTP 200 for the next 10 requests, etc. A well, you get it:
```bash
developer@developer-VirtualBox:~/projects/k4d/lab 8$ while true; do curl localhost:8080;sleep 1; done;
Something went wrong in your landing - this landing platform is malfunctioning: b0aa98851960
Something went wrong in your landing - this landing platform is malfunctioning: b0aa98851960
Something went wrong in your landing - this landing platform is malfunctioning: b0aa98851960
Something went wrong in your landing - this landing platform is malfunctioning: b0aa98851960
Something went wrong in your landing - this landing platform is malfunctioning: b0aa98851960
Something went wrong in your landing - this landing platform is malfunctioning: b0aa98851960
Something went wrong in your landing - this landing platform is malfunctioning: b0aa98851960
Something went wrong in your landing - this landing platform is malfunctioning: b0aa98851960
Something went wrong in your landing - this landing platform is malfunctioning: b0aa98851960
Hello, you landed on Terra10 and host b0aa98851960 welcomes you!
Hello, you landed on Terra10 and host b0aa98851960 welcomes you!
Hello, you landed on Terra10 and host b0aa98851960 welcomes you!
Hello, you landed on Terra10 and host b0aa98851960 welcomes you!
Hello, you landed on Terra10 and host b0aa98851960 welcomes you!
Hello, you landed on Terra10 and host b0aa98851960 welcomes you!
Hello, you landed on Terra10 and host b0aa98851960 welcomes you!
Hello, you landed on Terra10 and host b0aa98851960 welcomes you!
Hello, you landed on Terra10 and host b0aa98851960 welcomes you!
Hello, you landed on Terra10 and host b0aa98851960 welcomes you!
Something went wrong in your landing - this landing platform is malfunctioning: b0aa98851960
Something went wrong in your landing - this landing platform is malfunctioning: b0aa98851960
Something went wrong in your landing - this landing platform is malfunctioning: b0aa98851960
^C
developer@developer-VirtualBox:~/projects/k4d/lab 8$
```

** Start a Pod with this container AND a Readiness Probe **

Now, we will define a Pod that (1) uses this ready-status-toggling container and (2) has a Readiness Probe configured. The manifest file looks like:
```bash
apiVersion: v1
kind: Pod
metadata:
  name: terra10-readiness                        # Pod name
spec:
  containers:
  - image: lgorissen/terra10:readiness-problem   # use the faulty image
    name: terra10
    readinessProbe:                              # Liveness Probe specification starts here
      periodSeconds: 2                           # Probe runs every 2 seconds
      httpGet:                                   # Probe of type httpGet
        path: /									 # Probe calls http://<Pod IP addres:8080/
        port: 8080
```

Run the Pod:
```bash
developer@developer-VirtualBox:~/projects/k4d/lab 8$ k create -f terra10-readiness-problem.yaml 
pod/terra10-readiness created
developer@developer-VirtualBox:~/projects/k4d/lab 8$ k describe pod terra10-readiness | grep "^IP:"
IP:           172.17.0.5
developer@developer-VirtualBox:~/projects/k4d/lab 8$ curl 172.17.0.5:8080
Hello, you landed on Terra10 and host terra10-readiness welcomes you!
developer@developer-VirtualBox:~/projects/k4d/lab 8$ k get pod
NAME                READY     STATUS    RESTARTS   AGE
terra10-readiness   1/1       Running   0          39s
developer@developer-VirtualBox:~/projects/k4d/lab 8$ 
```
The Pod is running...

** Observe! **

For a better understanding of how the Readiness Probe works and what can be configured, use the command `k describe pod terra10-readiness`  and have a close look at the output. Below, a description of the relevant parts of the Readiness Probe:


```bash
    Readiness:      http-get http://:8080/ delay=0s timeout=1s period=2s #success=1 #failure=3
```

This line means:

|  item         | description                        |
|---------------|------------------------------------|
| http-get      | Probe type                         |
| http://:8080/ | Action that the Probe will perform |
| delay=0s     | Number of seconds after the container has started before readiness probes are initiated. |
| timeout=1s    | Number of seconds after which the probe times out. |
| period=2s    | How often (in seconds) to perform the probe.|
| #success=1    |Minimum consecutive successes for the probe to be considered successful after having failed.|
| #failure=3    | Minimum consecutive failures for the probe to be considered failed after having succeeded.| 

Now, we have Pod `tera10-readiness` running. This Pod has a Readiness probe that runs every 2 seconds. And after 10 requests, it will toggle between HTTP 200 and HTTP 500 responses. That means that our Pod Ready status must also toggle... let's find out:
```bash
developer@developer-VirtualBox:~/projects/k4d/lab 8$ while true; do k get pod;sleep 2; done
NAME                READY     STATUS    RESTARTS   AGE
terra10-readiness   1/1       Running   1          1h
NAME                READY     STATUS    RESTARTS   AGE
terra10-readiness   1/1       Running   1          1h
NAME                READY     STATUS    RESTARTS   AGE
terra10-readiness   0/1       Running   1          1h
NAME                READY     STATUS    RESTARTS   AGE
terra10-readiness   0/1       Running   1          1h
NAME                READY     STATUS    RESTARTS   AGE
terra10-readiness   0/1       Running   1          1h
NAME                READY     STATUS    RESTARTS   AGE
terra10-readiness   0/1       Running   1          1h
NAME                READY     STATUS    RESTARTS   AGE
terra10-readiness   0/1       Running   1          1h
NAME                READY     STATUS    RESTARTS   AGE
terra10-readiness   0/1       Running   1          1h
NAME                READY     STATUS    RESTARTS   AGE
terra10-readiness   0/1       Running   1          1h
NAME                READY     STATUS    RESTARTS   AGE
terra10-readiness   1/1       Running   1          1h
NAME                READY     STATUS    RESTARTS   AGE
terra10-readiness   1/1       Running   1          1h
NAME                READY     STATUS    RESTARTS   AGE
terra10-readiness   1/1       Running   1          1h
```

Did you notice that the Pod is slightly more 'ready' than 'not ready'? That's because 1 successful probe request marks the Pod as 'ready', whereas it takes 3 failures to mark the Pod as ' not ready'.

Clean up!

## Some concluding remarks

In this lab, we looked at the usage of Probes and how various categories of faults can be handled on a Kubernetes platform. Proper implementation of the Probes will give your application a better availability and those 'magical self-healing' capabilities that we are all looking for ;-)

In one of the next labs, we will show the combination of the Probes with a Resource Controller. That will also demonstrate that Kubernetes will NOT route requests to Pods that have status 'not ready'. 