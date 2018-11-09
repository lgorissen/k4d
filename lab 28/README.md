# 28. Kubernetes API Server: curl from within a Pod 

The DownwardAPI volume provides access to some metadata of a Pod and its Containers. You will want to talk directly to the Kubernetes API Server!

We will show several ways to access the Kubernetes API Server:

- Use *curl and the kubectl proxy*
- Use *curl - from within a Pod*
- Use *curl - and a sidecar Container*
- Use *client libraries*

All-in-all, that should give you enough tools to handle your requirements.

This lab will show how to access the Kubernetes API from within a Pod, using curl:

## Curl from within a Pod 

The set-up for this lab will be:

![k8s api server from pod](img/lab28-kubernetes-api-server-from-pod.png)

The container `terra10-curl` is an alpine image with *curl*  added to it. The Dockerfile can also be found in the `lab 28` directory:

```bash
FROM alpine
RUN apk update && apk add curl
```

Don't build the container image yourself: it is already available in the Docker registry `lgorissen/terra10-curl`.

The Pod that we will use for accessing the Kubernetes API Server has manifest file `terra10-curl.yaml`:

```bash
apiVersion: v1
kind: Pod
metadata:
  name: terra10-curl
spec:
  containers:
  - name: main
    image: lgorissen/terra10-curl     # use the Docker image with curl
    command: ["sleep", "9999999"]     # keep the Container alive
```

Starting such a Pod will create a Container with curl in it:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 28$ k create -f terra10-curl.yaml 
pod/terra10-curl created
developer@developer-VirtualBox:~/projects/k4d/lab 28$ k get pod terra10-curl 
NAME           READY     STATUS    RESTARTS   AGE
terra10-curl   1/1       Running   0          13s
developer@developer-VirtualBox:~/projects/k4d/lab 28$
```

From this Pod / Container, we will communicate with the Kubernetes API Server.
So, start a shell in the Container, look up the Kubernetes API Server IP address and port, and curl to it:

```bash
developer@developer-VirtualBox:~/projects/k4d/lab 28$ k exec -it terra10-curl /bin/sh
/ # env | grep KUBERNETES_SERVICE
KUBERNETES_SERVICE_PORT=443
KUBERNETES_SERVICE_PORT_HTTPS=443
KUBERNETES_SERVICE_HOST=10.96.0.1
/ # curl https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_SERVICE_PORT/api
curl: (60) SSL certificate problem: unable to get local issuer certificate
More details here: https://curl.haxx.se/docs/sslcerts.html

curl failed to verify the legitimacy of the server and therefore could not
establish a secure connection to it. To learn more about this situation and
how to fix it, please visit the web page mentioned above.
/ # 
```

The easy fix: use the *-k* option:

```bash
/ # curl -k https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_SERVICE_PORT/api
{
  "kind": "APIVersions",
  "versions": [
    "v1"
  ],
  "serverAddressByClientCIDRs": [
    {
      "clientCIDR": "0.0.0.0/0",
      "serverAddress": "10.0.2.15:8443"
    }
  ]
/ #
```

However, that is not what you want in a production set-up. You will want to avoid a possible 'man in the middle' attack. 

**Check the Kubernetes API Server's certificate**

For checking the Kubernetes API Server's certificate, *curl* needs the certificate that was used for signing the Kubernetes API Server's certificate. The signing certificate `ca.crt` can be found in the Container:

```bash
/ # ls /var/run/secrets/kubernetes.io/serviceaccount/
ca.crt     namespace  token
/ #
```
If you don't remember, look at the Secrets lab 23.

So, let *curl* check the certificate:

```bash
/ # curl --cacert /var/run/secrets/kubernetes.io/serviceaccount/ca.crt https://k
ubernetes/api
{
  "kind": "APIVersions",
  "versions": [
    "v1"
  ],
  "serverAddressByClientCIDRs": [
    {
      "clientCIDR": "0.0.0.0/0",
      "serverAddress": "10.0.2.15:8443"
    }
  ]
}/ # 

```
Note above, that we used `https://kubernetes/api` for addressing the Kubernetes API Server. That works because:

- the Kubernetes API Server runs on port 443 (= https) (= $KUBERNETES\_SERVICE\_PORT)
- and the Kubernetes DNS lookup for **kubernetes** will return the value for $KUBERNETES\_SERVICE\_HOST

**Authenticating with the Kubernetes API Server**

Above, the Kubernetes API Server responded. However, that's only because of the minikube set-up. Normally, you would also need to authenticate with the Kubernetes API Server.

Authentication has to be done with a bearer token in an http Header. The token can be found in the same folder where also the signing certificate was located. Let's put it in an environment variable TOKEN:

```bash
/ # TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)
/ # echo $TOKEN
eyJhbGciOiJSUzI1NiIsImtpZCI6IiJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImRlZmF1bHQtdG9rZW4tN3NkZHoiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiZGVmYXVsdCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6ImU2Njg0ODRkLWM5NDEtMTFlOC1hZjViLTA4MDAyNzYyNTFhMiIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDpkZWZhdWx0OmRlZmF1bHQifQ.LZZd7nEKYzAh46yPoj757ILL8k05IXCLZwAYV3mIHdiQLgXgfKPSHM4iosAk11Y_f3MdQeKGBfmoR_Cmpkiimdgtw68dFQd7f_Dc6tyKOcjpbdLrWnHr3zjTweqGAG_hbuDWZNZa6yoSPYe1MWTDRC-21Bx1dsi55mkGfVhIEaOpE73DmdPdd0jOiH18XKRaYN5zqoMICazwFQjKU4hsxAxD_ZavweCpEvGy6cnhATlyjgM_Yt2MKeGKb2oejsm_BNKeZySx4YmyjKUO6aEEksal5mLAeIRSD-FGqntcBLj5Bfv8PmnGlHdWAgSbCJV8ElLhFjheuFcuoKdy4hpUJw
/ #
```

Now, use the token in the *curl* invoke:

```bash
/ # curl -H "Authorization: Bearer $TOKEN" --cacert /var/run/secrets/kubernetes.
io/serviceaccount/ca.crt https://kubernetes/api
{
  "kind": "APIVersions",
  "versions": [
    "v1"
  ],
  "serverAddressByClientCIDRs": [
    {
      "clientCIDR": "0.0.0.0/0",
      "serverAddress": "10.0.2.15:8443"
    }
  ]
}/ #
```

**Namespace**

One of the first things you will need when querying the Kubernetes API Server is your own namespace. You may remember seeing it ... let's put it in an environment variable:

```bash
/ # NAMESPACE=$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace)
/ # echo $NAMESPACE
default
/ #
```

> **READ CAREFULLY**
>
> Now, in minikube, your service account does NOT have access the all parts of the API Server.
> This can be quickly *fixed* (mind not to do that in the Pod):
>
> ```bash
> developer@developer-VirtualBox:~/projects/k4d$ k create clusterrolebinding permissive-binding --clusterrole=cluster-admin --group=system:serviceaccounts
> clusterrolebinding.rbac.authorization.k8s.io/permissive-binding created
> developer@developer-VirtualBox:~/projects/k4d$
> ```
> You have now given all service accounts the cluster-admin role - and hence way too many
> permissions. DON'T DO THIS IN PRODUCTION



So, now query the Kubernetes API Server for the Pods in your own namespace:

```bash
/ # curl -H "Authorization: Bearer $TOKEN" --cacert /var/run/secrets/kubernetes.
io/serviceaccount/ca.crt https://kubernetes/api/v1/namespaces/$NAMESPACE/pods
{
  "kind": "PodList",
  "apiVersion": "v1",
  "metadata": {
    "selfLink": "/api/v1/namespaces/default/pods",
    "resourceVersion": "231858"
  },
  "items": [
    {
      "metadata": {
        "name": "terra10-curl",
        "namespace": "default",
        "selfLink": "/api/v1/namespaces/default/pods/terra10-curl",
        "uid": "c85f125d-e467-11e8-9cb1-0800276251a2",
        "resourceVersion": "227509",
        "creationTimestamp": "2018-11-09T21:38:22Z"
      },
      "spec": {
        "volumes": [
          {
            "name": "default-token-7sddz",
            "secret": {
...
```

Lab done - clean up!