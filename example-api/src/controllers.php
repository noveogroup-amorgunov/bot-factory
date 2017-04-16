<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

//Request::setTrustedProxies(array('127.0.0.1'));

$app->get('/', function () use ($app) {
    return new Response('Pizza API');
})
    ->bind('homepage');

$pizzaStore = [
    'пепперони' => [
        'name' => 'Пепперони',
        'image' => 'http://slice.seriouseats.com/images/20100201-delivery-papajohns.jpg',
        'description' => 'Пепперони - одна из самых популярных пицц в мире. Да что уж, это самая популярная пицца во Вселенной!',
    ],
    'маргарита' => [
        'name' => 'Маргарита',
        'image' => 'https://qph.ec.quoracdn.net/main-qimg-311ad5650cf27f9a806ada70a21a2678-c',
        'description' => 'Эта пицца названа в честь итальянской королевы Маргариты Савонской, покровительницы Красного креста.',
    ],
    'с цыпленком' => [
        'name' => 'С цыпленком',
        'image' => 'http://www.jackspizza.com/media/1039/cheese.jpg',
        'description' => 'Когда доедаешь последний кусочек этой пиццы, в голове невольно начинает играть кантри и хочется арканить диких мустангов.',
    ],
    'с грибами' => [
        'name' => 'С грибами',
        'image' => 'http://www.jackspizza.com/media/1039/cheese.jpg',
        'description' => 'Любите грибы, но не любите медведей, комаров и лес? Тогда эта пицца придуманна именно для вас.',
    ],

];
$pizzaPrice = [
    'маленькая' => ['value' => '25 см', 'price' => 300],
    'средняя' => ['value' => '30 см', 'price' => 450],
    'большая' => ['value' => '35 см', 'price' => 550],
];

$app->get('/product/{code}', function (Request $request) use ($app, $pizzaStore) {
    $code = $request->get('code');
    return new JsonResponse($pizzaStore[$code]);
});

$app->get('/products', function () use ($app, $pizzaStore) {
    return new JsonResponse($pizzaStore);
});

$app->get('/sizes', function () use ($app, $pizzaPrice) {
    return new JsonResponse($pizzaPrice);
});

$app->get('/popular_others', function () use ($app, $pizzaStore) {
    $results = array_values(array_map(function ($value) {
        return $value['name'];
    }, $pizzaStore));
    $rand = array_rand($results, 1);
    unset($results[$rand]);
    return new JsonResponse(['data' => array_values($results)]);
});

$app->get('/new_offer', function () use ($app, $pizzaStore) {
    $results = array_values(array_map(function ($value) {
        return $value['name'];
    }, $pizzaStore));
    $rand = array_rand($results, 1);
    return new JsonResponse(['data' => $results[$rand]]);
});

$app->get('/order', function (Request $request) use ($pizzaStore, $pizzaPrice) {
    $type = $request->get('type');
    $size = $request->get('size');
    $quantity = $request->get('count');

    // process order..

    return new JsonResponse([
            'success' => true,
            'message' => sprintf('Вы успешно сделали заказ! %s уже едет к Вам. Общая сумма заказа: %d',
                $pizzaStore[$type]['name'],
                $pizzaPrice[$size]['price'] * $quantity
            ),
        ]
    );
});

// Constructor requests

$app->get('constructor/types', function () use ($app, $pizzaStore) {
    return new JsonResponse(['data' => array_values(array_map(function ($value) {
        return $value['name'];
    }, $pizzaStore))]);
});

$app->get('constructor/sizes', function () use ($app, $pizzaPrice) {
    return new JsonResponse(['data' => array_values(array_map(function ($value) {
        return $value['value'];
    }, $pizzaPrice))]);
});


$app->error(function (\Exception $e, Request $request, $code) use ($app) {
    if ($app['debug']) {
        return;
    }

    // 404.html, or 40x.html, or 4xx.html, or error.html
    $templates = array(
        'errors/' . $code . '.html.twig',
        'errors/' . substr($code, 0, 2) . 'x.html.twig',
        'errors/' . substr($code, 0, 1) . 'xx.html.twig',
        'errors/default.html.twig',
    );

    return new Response($app['twig']->resolveTemplate($templates)->render(array('code' => $code)), $code);
});
