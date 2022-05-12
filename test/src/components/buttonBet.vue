<template>
  <button class="buttonShape" type="button">
    <div class="buttonBet">
      <p class="buttonText">{{ buttonText }}</p>
    </div>
  </button>
</template>

<script>
export default {
  props: ["buttonText"],
};
</script>

<style lang="scss" scoped>
.buttonShape {
  width: 93px;
  height: 93px;
  background-color: #292c33;
  border-radius: 50%;
  box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.3),
    -5px -5px 20px rgba(255, 255, 255, 0.12),
    inset -4px -4px 10px rgba(255, 255, 255, 0.12),
    inset 4px 4px 10px rgba(0, 0, 0, 0.25);
  display: flex;
  overflow: hidden;

  justify-content: center;
  align-items: center;
  border: 0px;
  cursor: pointer;
}
.buttonBet {
  width: 83px;
  height: 83px;
  border-radius: 50%;
  background-color: #292c33;
  box-shadow: inset 4px 4px 20px rgba(255, 255, 255, 0.12),
    inset -4px -4px 20px rgba(0, 0, 0, 0.25);
  display: flex;
  justify-content: center;
  align-items: center;
}
.buttonText {
  max-width: 44px;
}
</style>
