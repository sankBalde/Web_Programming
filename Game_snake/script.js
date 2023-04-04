window.onload = function()
{
    var canvasWidth = 900;
    var canvasHeight = 600;
    var blockSize = 30;
    var ctx;
    var delay = 300;
    var widthInBlocks = canvasWidth/blockSize;
    var heightInBlocks = canvasHeight/blockSize;
    var snakee;
    var applee;
    var score;
    var timeOut;

    init();
    
    function new_snake_and_apple()
    {

        var direction = ["left", "right", "up", "down"];
        optional_direction = Math.round(Math.random() * (direction.length - 1));
        var snakeX = Math.round(Math.random() * (widthInBlocks - 5));
        var snakeY = Math.round(Math.random() * (heightInBlocks - 5));
        var appleeX = Math.round(Math.random() * (widthInBlocks - 1));
        var appleeY = Math.round(Math.random() * (heightInBlocks - 1));
        snakee = new Snake([[snakeX,snakeY]], direction[optional_direction]);
        applee = new Apple([appleeX,appleeY]);
    }


    function init()
    {
        var canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "30px solid gray";
        canvas.style.margin = "50px auto";
        canvas.style.display = "block";
        canvas.style.backgroundImage = "url('snake_img.png')";
        canvas.style.backgroundSize = "cover";
        //canvas.style.backgroundColor ="#ddd";
        document.body.appendChild(canvas);
        ctx = canvas.getContext("2d");
        score = 0;
        new_snake_and_apple();
        refreshCanvas();
    }

    function speedUp()
    {
        if (delay > 100)
        {
            delay -= 50;
        }
    }

    function refreshCanvas()
    {
        snakee.advance();
        if (snakee.checkCollision())
        {
            game_over();
        }
        else
        {
            
            if (snakee.isEatingApple(applee))
            {
                snakee.ateApple = true;
                score++;
                if (score % 5 == 0)
                {
                    speedUp();
                }
                do 
                {
                    applee.setNewPosition();
                }
                while (applee.isOnSnake(snakee))    
            }
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            draw_score();
            snakee.draw();
            applee.draw();
            timeOut = setTimeout(refreshCanvas, delay);
        }
    }

    function draw_block(ctx, position)
    {
        var x = position[0] * blockSize;
        var y = position[1] * blockSize;
        ctx.fillRect(x, y, blockSize, blockSize);
    }

    function Snake(body, direction)
    {
        this.body = body;
        this.direction = direction;
        this.ateApple = false;
        this.draw = function()
        {
            ctx.save();
            ctx.fillStyle = "#121212";
            for (var i = 0; i < this.body.length; i++)
            {
                draw_block(ctx, this.body[i]);
            }
            ctx.restore();
        };
        this.advance = function()
        {
            var nextPosition = this.body[0].slice();
            switch(this.direction)
            {
                case "left":
                    nextPosition[0]--; 
                    break;
                case "right":
                    nextPosition[0]++;
                    break;
                case "down":
                    nextPosition[1]++;
                    break;
                case "up":
                    nextPosition[1]--;
                    break;
                default:
                    break;
            }
            this.setDirection = function(newDirection)
            {
                var allowedDirections;
                switch(this.direction)
                {
                    case "left":
                    case "right":
                        allowedDirections = ["up", "down"];
                        break;
                    case "down":
                    case "up":
                        allowedDirections = ["left", "right"];
                        break;
                    default:
                        break;
                }
                if (allowedDirections.indexOf(newDirection) > -1)
                {
                    this.direction = newDirection;
                }
            };
            this.body.unshift(nextPosition);
            if (!this.ateApple)
                this.body.pop();
            else
                this.ateApple = false;
        };
        this.checkCollision = function()
        {
            var wallCollision = false;
            var snakeCollision = false;
            var head = this.body[0];
            var rest = this.body.slice(1);
            var snakeX = head[0];
            var snakeY = head[1];
            var minX = 0;
            var minY = 0;
            var maxX = widthInBlocks - 1;
            var maxY = heightInBlocks - 1;
            var is_not_between_hori_wall = snakeX < minX || snakeX > maxX;
            var is_not_between_verti_wall = snakeY < minY || snakeY > maxY;
            if (is_not_between_hori_wall || is_not_between_verti_wall)
            {
                wallCollision = true;
            }
            for (var i = 0; i < rest.length; i++)
            {
                if (snakeX === rest[i][0] && snakeY === rest[i][1])
                {
                    snakeCollision = true;
                }
            }
            return wallCollision || snakeCollision;

        }
        this.isEatingApple = function (apple_to_eat)
        {
            var head = this.body[0];
            if (head[0] === apple_to_eat.position[0] && head[1] === apple_to_eat.position[1])
            {
                return true;
            }
            return false;
        }
    }

    document.onkeydown = function handleKeyDown(e)
    {
        var key = e.keyCode;
        var newDirection;
        switch(key)
        {
            case 37:
                newDirection = "left";
                break;
            case 38:
                newDirection = "up";
                break;
            case 39:
                newDirection = "right";
                break;
            case 40:
                newDirection = "down";
                break;
            case 32:
                restart();
                return;
            default:
                return;
        }
        snakee.setDirection(newDirection);
    }

    function Apple(position)
    {
        this.position = position;
        this.draw = function()
        {
            ctx.save();
            ctx.fillStyle = "#B22222";
            ctx.beginPath();
            var radius = blockSize/2;
            var x = this.position[0] * blockSize + radius;
            var y = this.position[1] * blockSize + radius;
            ctx.arc(x, y, radius, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.restore();
        }
        this.setNewPosition = function()
        {
            var newX = Math.round(Math.random() * (widthInBlocks - 1));
            var newY = Math.round(Math.random() * (heightInBlocks - 1));
            this.position = [newX, newY];
        }
        this.isOnSnake = function (snake)
        {
            var TouchSnake = false;
            for (var i = 0; i < snake.body.length; i++)
            {
                if (this.position[0] == snake.body[i][0] && this.position[1] == snake.body[i][1])
                {
                    TouchSnake = true;
                }
            }
            return TouchSnake;
        }
    }

    function game_over()
    {
        ctx.save();
        ctx.font = "bold 70px sans-serif";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 5;
        ctx.strokeText("Game Over", canvasWidth/2, canvasHeight/2 - 180);
        ctx.fillText("Game Over", canvasWidth/2,  canvasHeight/2 - 180);
        ctx.font = "bold 30px sans-serif";
        ctx.fillStyle = "green";
        ctx.strokeStyle = "white";
        ctx.strokeText("Appuyer sur la touche Espace pour rejouer", canvasWidth/2, canvasHeight/2 - 120);
        ctx.fillText("Appuyer sur la touche Espace pour rejouer", canvasWidth/2, canvasHeight/2 - 120);
        ctx.restore();
    }

    function restart()
    {
        new_snake_and_apple();
        score = 0;
        clearTimeout(timeOut);
        refreshCanvas();
    }

    function draw_score()
    {   
        ctx.save();
        ctx.font = "bold 200px sans-serif";
        ctx.fillStyle = "gray";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(score.toString(), canvasWidth/2, canvasHeight/2);
        ctx.restore();
    }
}